package com.conceptviz.conceptvizbackend.security;

import com.conceptviz.conceptvizbackend.entity.User;
import com.conceptviz.conceptvizbackend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${cors.allowed.origins}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        if (response.isCommitted()) {
            log.warn("Response has already been committed. Unable to redirect.");
            return;
        }

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String providerId = oAuth2User.getAttribute("sub");

            log.info("OAuth2 authentication successful for email: {}", email);

            // Find or create user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("Creating new user from OAuth2: {}", email);
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setAuthProvider(User.AuthProvider.GOOGLE);
                newUser.setProviderId(providerId);
                return userRepository.save(newUser);
            });

            String token = jwtUtil.generateToken(user.getEmail());

            // Use UriComponentsBuilder for safe URL construction
            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl)
                    .path("/oauth2/redirect")
                    .queryParam("token", token)
                    .queryParam("email", email)
                    .queryParam("name", name)
                    .build()
                    .toUriString();

            log.info("Redirecting to: {}", redirectUrl);

            // Clear any existing response
            response.reset();

            // Set proper headers for redirect
            response.setStatus(HttpServletResponse.SC_FOUND);
            response.setHeader("Location", redirectUrl);
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");

        } catch (Exception e) {
            log.error("Error during OAuth2 authentication success handling", e);

            // Redirect to frontend with error
            String errorUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl)
                    .queryParam("error", "oauth_failed")
                    .build()
                    .toUriString();

            response.reset();
            response.setStatus(HttpServletResponse.SC_FOUND);
            response.setHeader("Location", errorUrl);
        }
    }
}