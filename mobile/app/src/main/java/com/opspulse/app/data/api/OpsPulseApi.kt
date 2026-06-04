package com.opspulse.app.data.api

import com.opspulse.app.data.model.*
import retrofit2.http.*

interface OpsPulseApi {

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponse

    @PATCH("auth/fcm-token")
    suspend fun updateFcmToken(@Body body: FcmTokenRequest)

    @GET("servers")
    suspend fun getServers(): List<Server>

    @POST("servers")
    suspend fun createServer(@Body body: CreateServerRequest): Server

    @DELETE("servers/{id}")
    suspend fun deleteServer(@Path("id") id: String)

    @GET("servers/{id}/logs")
    suspend fun getPingLogs(
        @Path("id") id: String,
        @Query("limit") limit: Int = 60,
    ): List<PingLog>

    @GET("servers/{id}/alerts")
    suspend fun getAlerts(@Path("id") id: String): List<Alert>

    @GET("servers/alerts")
    suspend fun getAllAlerts(
        @Query("type") type: String? = null,
        @Query("limit") limit: Int = 100,
    ): List<AlertWithServer>

    @GET("servers/stats")
    suspend fun getStats(): Stats
}
