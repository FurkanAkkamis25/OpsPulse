package com.opspulse.app.ui.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.messaging.FirebaseMessaging
import com.opspulse.app.data.model.Alert
import com.opspulse.app.data.model.PingLog
import com.opspulse.app.data.model.Server
import com.opspulse.app.data.repository.ServerRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

data class DashboardUiState(
    val servers: List<Server> = emptyList(),
    val selectedServer: Server? = null,
    val pingLogs: List<PingLog> = emptyList(),
    val alerts: List<Alert> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null,
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: ServerRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(DashboardUiState())
    val state = _state.asStateFlow()

    init {
        loadServers()
        registerFcmToken()
    }

    fun loadServers() = viewModelScope.launch {
        _state.value = _state.value.copy(loading = true, error = null)
        runCatching { repository.getServers() }
            .onSuccess { _state.value = _state.value.copy(servers = it, loading = false) }
            .onFailure { _state.value = _state.value.copy(loading = false, error = it.message) }
    }

    fun selectServer(server: Server) = viewModelScope.launch {
        _state.value = _state.value.copy(selectedServer = server)
        val logs = runCatching { repository.getPingLogs(server.id) }.getOrDefault(emptyList())
        val alerts = runCatching { repository.getAlerts(server.id) }.getOrDefault(emptyList())
        _state.value = _state.value.copy(pingLogs = logs.reversed(), alerts = alerts)
    }

    fun clearSelection() {
        _state.value = _state.value.copy(selectedServer = null, pingLogs = emptyList(), alerts = emptyList())
    }

    private fun registerFcmToken() = viewModelScope.launch {
        runCatching {
            val token = FirebaseMessaging.getInstance().token.await()
            Log.d("OpsPulse", "FCM token obtained: ${token.take(20)}...")
            repository.updateFcmToken(token)
            Log.d("OpsPulse", "FCM token sent to backend successfully")
        }.onFailure { e ->
            Log.e("OpsPulse", "FCM token registration failed: ${e.message}", e)
        }
    }
}
