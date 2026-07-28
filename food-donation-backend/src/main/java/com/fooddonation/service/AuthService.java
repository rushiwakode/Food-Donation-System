package com.fooddonation.service;

import com.fooddonation.dto.request.ForgotPasswordRequest;
import com.fooddonation.dto.request.LoginRequest;
import com.fooddonation.dto.request.RegisterRequest;
import com.fooddonation.dto.request.ResetPasswordRequest;
import com.fooddonation.dto.response.AuthResponse;

public interface AuthService {

	AuthResponse register(RegisterRequest request);

	AuthResponse login(LoginRequest request);

	AuthResponse refreshToken(String refreshToken);

	void logout(String token);

	void forgotPassword(ForgotPasswordRequest request);

	void resetPassword(ResetPasswordRequest request);

	void verifyEmail(String token);

}
