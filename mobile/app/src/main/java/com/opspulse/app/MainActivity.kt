package com.opspulse.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.opspulse.app.ui.screen.DashboardScreen
import com.opspulse.app.ui.screen.LoginScreen
import com.opspulse.app.ui.screen.RegisterScreen
import com.opspulse.app.ui.theme.OpsPulseTheme
import com.opspulse.app.ui.viewmodel.AuthViewModel
import com.opspulse.app.util.TokenManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var tokenManager: TokenManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val hasToken = runBlocking { tokenManager.getToken() != null }
        val startDestination = if (hasToken) "dashboard" else "login"

        setContent {
            OpsPulseTheme {
                val navController = rememberNavController()

                NavHost(navController = navController, startDestination = startDestination) {
                    composable("login") {
                        val vm = hiltViewModel<AuthViewModel>()
                        LoginScreen(
                            onSuccess = { navController.navigate("dashboard") { popUpTo("login") { inclusive = true } } },
                            onRegisterClick = { navController.navigate("register") },
                            viewModel = vm,
                        )
                    }
                    composable("register") {
                        val vm = hiltViewModel<AuthViewModel>()
                        RegisterScreen(
                            onSuccess = { navController.navigate("dashboard") { popUpTo("register") { inclusive = true } } },
                            onLoginClick = { navController.popBackStack() },
                            viewModel = vm,
                        )
                    }
                    composable("dashboard") {
                        val authVm = hiltViewModel<AuthViewModel>()
                        DashboardScreen(
                            onLogout = {
                                authVm.logout()
                                navController.navigate("login") { popUpTo("dashboard") { inclusive = true } }
                            },
                        )
                    }
                }
            }
        }
    }
}
