package com.opspulse.app.data.model

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String)
data class AuthResponse(val token: String)
data class FcmTokenRequest(val fcmToken: String)
data class CreateServerRequest(val name: String, val url: String, val type: String = "EXTERNAL")

data class Server(
    val id: String,
    val name: String,
    val url: String,
    val type: String = "EXTERNAL",
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

data class AlertWithServer(
    val id: String,
    val type: String,
    val message: String,
    val sentAt: String,
    val server: ServerRef,
)

data class ServerRef(val name: String)

data class Stats(
    val totalServers: Int,
    val online: Int,
    val offline: Int,
    val avgHealthScore: Int?,
    val avgLatency: Int?,
    val bestServer: ServerHealth?,
    val worstServer: ServerHealth?,
)

data class ServerHealth(val name: String, val healthScore: Double?)
