package com.opspulse.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opspulse.app.data.model.Stats
import com.opspulse.app.data.repository.ServerRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class StatsUiState(
    val stats: Stats? = null,
    val loading: Boolean = true,
    val refreshing: Boolean = false,
)

@HiltViewModel
class StatsViewModel @Inject constructor(
    private val repository: ServerRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(StatsUiState())
    val state = _state.asStateFlow()

    init { load() }

    fun load() = viewModelScope.launch {
        _state.value = _state.value.copy(loading = true)
        runCatching { repository.getStats() }
            .onSuccess { _state.value = _state.value.copy(stats = it, loading = false) }
            .onFailure { _state.value = _state.value.copy(loading = false) }
    }

    fun refresh() = viewModelScope.launch {
        _state.value = _state.value.copy(refreshing = true)
        runCatching { repository.getStats() }
            .onSuccess { _state.value = _state.value.copy(stats = it, refreshing = false) }
            .onFailure { _state.value = _state.value.copy(refreshing = false) }
    }
}
