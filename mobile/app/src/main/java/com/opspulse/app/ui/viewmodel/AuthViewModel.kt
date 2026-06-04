package com.opspulse.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opspulse.app.data.repository.ServerRepository
import com.opspulse.app.util.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException
import javax.inject.Inject

sealed interface AuthState {
    data object Idle : AuthState
    data object Loading : AuthState
    data object Success : AuthState
    data class Error(val message: String) : AuthState
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repository: ServerRepository,
    private val tokenManager: TokenManager,
) : ViewModel() {

    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state = _state.asStateFlow()

    fun login(email: String, password: String) = viewModelScope.launch {
        _state.value = AuthState.Loading
        runCatching { repository.login(email, password) }
            .onSuccess { res ->
                tokenManager.saveToken(res.token)
                _state.value = AuthState.Success
            }
            .onFailure { e ->
                val msg = if (e is HttpException) "Geçersiz e-posta veya şifre (${e.code()})" else "Sunucuya ulaşılamıyor — Wi-Fi kontrol et"
                _state.value = AuthState.Error(msg)
            }
    }

    fun register(name: String, email: String, password: String) = viewModelScope.launch {
        _state.value = AuthState.Loading
        runCatching { repository.register(name, email, password) }
            .onSuccess { res ->
                tokenManager.saveToken(res.token)
                _state.value = AuthState.Success
            }
            .onFailure { e ->
                val msg = when {
                    e is HttpException && e.code() == 409 -> "E-posta zaten kullanımda"
                    e is HttpException && e.code() == 400 -> "Şifre en az 8 karakter olmalı"
                    e is HttpException -> "Sunucu hatası (${e.code()})"
                    else -> "Sunucuya ulaşılamıyor — Wi-Fi kontrol et"
                }
                _state.value = AuthState.Error(msg)
            }
    }

    fun logout() = viewModelScope.launch {
        tokenManager.clearToken()
        _state.value = AuthState.Idle
    }
}
