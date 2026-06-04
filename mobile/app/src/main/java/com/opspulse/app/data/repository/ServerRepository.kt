package com.opspulse.app.data.repository

import com.opspulse.app.data.api.ApiClient
import com.opspulse.app.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ServerRepository @Inject constructor(private val apiClient: ApiClient) {

    suspend fun login(email: String, password: String): AuthResponse =
        apiClient.api.login(LoginRequest(email, password))

    suspend fun register(name: String, email: String, password: String): AuthResponse =
        apiClient.api.register(RegisterRequest(name, email, password))

    suspend fun updateFcmToken(token: String) =
        apiClient.api.updateFcmToken(FcmTokenRequest(token))

    suspend fun getServers(): List<Server> = apiClient.api.getServers()

    suspend fun createServer(name: String, url: String, type: String = "EXTERNAL"): Server =
        apiClient.api.createServer(CreateServerRequest(name, url, type))

    suspend fun deleteServer(id: String) = apiClient.api.deleteServer(id)

    suspend fun getPingLogs(serverId: String): List<PingLog> =
        apiClient.api.getPingLogs(serverId)

    suspend fun getAlerts(serverId: String): List<Alert> =
        apiClient.api.getAlerts(serverId)

    suspend fun getAllAlerts(type: String? = null): List<AlertWithServer> =
        apiClient.api.getAllAlerts(type)

    suspend fun getStats(): Stats = apiClient.api.getStats()
}
