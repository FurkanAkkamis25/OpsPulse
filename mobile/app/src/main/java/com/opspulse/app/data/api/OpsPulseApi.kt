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

    @GET("servers/{id}/logs")
    suspend fun getPingLogs(
        @Path("id") id: String,
        @Query("limit") limit: Int = 60,
    ): List<PingLog>

    @GET("servers/{id}/alerts")
    suspend fun getAlerts(@Path("id") id: String): List<Alert>
}
