package com.opspulse.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opspulse.app.data.model.AlertWithServer
import com.opspulse.app.data.repository.ServerRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AlertsUiState(
    val alerts: List<AlertWithServer> = emptyList(),
    val filter: String? = null,
    val loading: Boolean = true,
    val refreshing: Boolean = false,
)

@HiltViewModel
class AlertsViewModel @Inject constructor(
    private val repository: ServerRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AlertsUiState())
    val state = _state.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _state.value = _state.value.copy(loading = true)
        runCatching { repository.getAllAlerts(_state.value.filter) }
            .onSuccess { _state.value = _state.value.copy(alerts = it, loading = false) }
            .onFailure { _state.value = _state.value.copy(loading = false) }
    }

    fun refresh() = viewModelScope.launch {
        _state.value = _state.value.copy(refreshing = true)
        runCatching { repository.getAllAlerts(_state.value.filter) }
            .onSuccess { _state.value = _state.value.copy(alerts = it, refreshing = false) }
            .onFailure { _state.value = _state.value.copy(refreshing = false) }
    }

    fun setFilter(type: String?) {
        _state.value = _state.value.copy(filter = type)
        load()
    }
}
