package com.opspulse.app.data.model

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String)
data class AuthResponse(val token: String)
data class FcmTokenRequest(val fcmToken: String)

data class Server(
    val id: String,
    val name: String,
    val url: String,
    val isActive: Boolean,
    val healthScore: Double?,
    val threshold: Int?,
)

data class PingLog(
    val id: String,
    val latency: Int?,
    val isUp: Boolean,
    val checkedAt: String,
)

data class Alert(
    val id: String,
    val type: String,
    val message: String,
    val sentAt: String,
)
