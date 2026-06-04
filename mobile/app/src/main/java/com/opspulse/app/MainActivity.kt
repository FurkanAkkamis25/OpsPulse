package com.opspulse.app

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.opspulse.app.ui.screen.*
import com.opspulse.app.ui.theme.Gray800
import com.opspulse.app.ui.theme.Gray900
import com.opspulse.app.ui.theme.Gray950
import com.opspulse.app.ui.theme.OpsPulseTheme
import com.opspulse.app.ui.viewmodel.AuthViewModel
import com.opspulse.app.util.TokenManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

sealed class BottomTab(val route: String, val label: String, val icon: ImageVector) {
    data object Servers : BottomTab("servers", "Sunucular", Icons.Default.Home)
    data object Alerts : BottomTab("alerts", "Uyarılar", Icons.Default.Notifications)
    data object Stats : BottomTab("stats", "İstatistikler", Icons.Default.Star)
    data object Profile : BottomTab("profile", "Profil", Icons.Default.Person)
}

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var tokenManager: TokenManager

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        createNotificationChannel()
        requestNotificationPermission()

        val hasToken = runBlocking { tokenManager.getToken() != null }

        setContent {
            OpsPulseTheme {
                val navController = rememberNavController()

                NavHost(navController = navController, startDestination = if (hasToken) "main" else "login") {
                    composable("login") {
                        val vm = hiltViewModel<AuthViewModel>()
                        LoginScreen(
                            onSuccess = { navController.navigate("main") { popUpTo("login") { inclusive = true } } },
                            onRegisterClick = { navController.navigate("register") },
                            viewModel = vm,
                        )
                    }
                    composable("register") {
                        val vm = hiltViewModel<AuthViewModel>()
                        RegisterScreen(
                            onSuccess = { navController.navigate("main") { popUpTo("register") { inclusive = true } } },
                            onLoginClick = { navController.popBackStack() },
                            viewModel = vm,
                        )
                    }
                    composable("main") {
                        MainScreen(
                            onLogout = {
                                navController.navigate("login") { popUpTo("main") { inclusive = true } }
                            }
                        )
                    }
                }
            }
        }
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel("opspulse_alerts", "OpsPulse Uyarıları", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Sunucu çökme ve kurtarma uyarıları"
            enableVibration(true)
        }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(onLogout: () -> Unit) {
    val navController = rememberNavController()
    val tabs = listOf(BottomTab.Servers, BottomTab.Alerts, BottomTab.Stats, BottomTab.Profile)
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    Scaffold(
        containerColor = Gray950,
        bottomBar = {
            NavigationBar(
                containerColor = Gray900,
                contentColor = Color.White,
                tonalElevation = 0.dp,
            ) {
                tabs.forEach { tab ->
                    val selected = currentDestination?.hierarchy?.any { it.route == tab.route } == true
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            navController.navigate(tab.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label, style = MaterialTheme.typography.labelSmall) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = com.opspulse.app.ui.theme.Brand500,
                            selectedTextColor = com.opspulse.app.ui.theme.Brand500,
                            unselectedIconColor = com.opspulse.app.ui.theme.Gray400,
                            unselectedTextColor = com.opspulse.app.ui.theme.Gray400,
                            indicatorColor = com.opspulse.app.ui.theme.Brand500.copy(alpha = 0.15f),
                        ),
                    )
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = BottomTab.Servers.route,
            modifier = Modifier.padding(padding),
        ) {
            composable(BottomTab.Servers.route) { DashboardScreen() }
            composable(BottomTab.Alerts.route) { AlertsScreen() }
            composable(BottomTab.Stats.route) { StatsScreen() }
            composable(BottomTab.Profile.route) {
                val authVm = hiltViewModel<AuthViewModel>()
                ProfileScreen(onLogout = {
                    authVm.logout()
                    onLogout()
                })
            }
        }
    }
}
