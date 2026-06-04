package com.opspulse.app.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.opspulse.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(onLogout: () -> Unit) {
    var notificationsEnabled by remember { mutableStateOf(true) }
    var showLogoutDialog by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(
        Brush.verticalGradient(colors = listOf(Gray950, Color(0xFF0D1B2A), Gray900))
    )) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                    title = { Text("Profil", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp) },
                )
            }
        ) { padding ->
            Column(modifier = Modifier.padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {

                // Profil avatarı
                Surface(color = Gray900, shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        Box(
                            modifier = Modifier.size(56.dp).clip(CircleShape)
                                .background(Brush.linearGradient(colors = listOf(Brand500, Color(0xFF7C3AED)))),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text("OP", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                        }
                        Column {
                            Text("OpsPulse", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("Altyapı İzleme Platformu", color = Gray400, fontSize = 12.sp)
                        }
                    }
                }

                // Ayarlar
                Text("Ayarlar", color = Gray400, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 4.dp))

                Surface(color = Gray900, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                    Column {
                        SettingRow(
                            icon = Icons.Default.Notifications,
                            title = "Bildirimler",
                            subtitle = "Sunucu uyarılarını al",
                            trailing = {
                                Switch(
                                    checked = notificationsEnabled,
                                    onCheckedChange = { notificationsEnabled = it },
                                    colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Brand500),
                                )
                            }
                        )
                        HorizontalDivider(color = Gray800)
                        SettingRow(
                            icon = Icons.Default.Info,
                            title = "Versiyon",
                            subtitle = "OpsPulse v1.0.0",
                            trailing = {}
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))

                // Çıkış
                Text("Hesap", color = Gray400, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 4.dp))

                Surface(color = Gray900, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                    SettingRow(
                        icon = Icons.AutoMirrored.Filled.ExitToApp,
                        iconTint = Red400,
                        title = "Çıkış Yap",
                        subtitle = "Hesabından güvenli çıkış yap",
                        titleColor = Red400,
                        trailing = {},
                        onClick = { showLogoutDialog = true },
                    )
                }

                Spacer(Modifier.height(8.dp))

                // Durum kartı
                Surface(
                    color = Brand500.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("🚀", fontSize = 24.sp)
                        Column {
                            Text("Sistem Aktif", color = Brand500, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Altyapı izleme çalışıyor", color = Gray400, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            containerColor = Gray900,
            title = { Text("Çıkış Yap", color = Color.White, fontWeight = FontWeight.Bold) },
            text = { Text("Hesabından çıkış yapmak istediğine emin misin?", color = Gray400) },
            confirmButton = {
                Button(
                    onClick = onLogout,
                    colors = ButtonDefaults.buttonColors(containerColor = Red400),
                    shape = RoundedCornerShape(8.dp),
                ) { Text("Çıkış Yap") }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) { Text("İptal", color = Gray400) }
            }
        )
    }
}

@Composable
private fun SettingRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    trailing: @Composable () -> Unit,
    iconTint: Color = Brand500,
    titleColor: Color = Color.White,
    onClick: (() -> Unit)? = null,
) {
    val modifier = if (onClick != null) Modifier.fillMaxWidth().then(Modifier) else Modifier.fillMaxWidth()
    Surface(
        onClick = onClick ?: {},
        color = Color.Transparent,
        modifier = modifier,
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(22.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(title, color = titleColor, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                Text(subtitle, color = Gray400, fontSize = 12.sp)
            }
            trailing()
        }
    }
}
