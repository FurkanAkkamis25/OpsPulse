package com.opspulse.app.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.opspulse.app.data.model.Alert
import com.opspulse.app.data.model.PingLog
import com.opspulse.app.data.model.Server
import com.opspulse.app.ui.theme.*
import com.opspulse.app.ui.viewmodel.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogout: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(colors = listOf(Gray950, Color(0xFF0D1B2A), Gray900)))
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                    title = {
                        if (state.selectedServer != null)
                            Text(state.selectedServer!!.name, color = Color.White, fontWeight = FontWeight.Bold)
                        else
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Box(
                                    modifier = Modifier.size(32.dp).clip(RoundedCornerShape(8.dp))
                                        .background(Brush.linearGradient(colors = listOf(Brand500, Color(0xFF7C3AED)))),
                                    contentAlignment = Alignment.Center,
                                ) { Text("OP", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp) }
                                Text("OpsPulse", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                            }
                    },
                    navigationIcon = {
                        if (state.selectedServer != null) {
                            IconButton(onClick = { viewModel.clearSelection() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Color.White)
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = { viewModel.loadServers() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Yenile", tint = Gray400)
                        }
                        if (state.selectedServer == null) {
                            TextButton(onClick = onLogout) {
                                Text("Çıkış", color = Gray400, fontSize = 13.sp)
                            }
                        }
                    },
                )
            }
        ) { padding ->
            Box(modifier = Modifier.padding(padding).fillMaxSize()) {
                when {
                    state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Brand500)
                    }
                    state.error != null -> Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text(state.error!!, color = Red400, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                    }
                    state.selectedServer != null -> ServerDetailPane(state.selectedServer!!, state.pingLogs, state.alerts)
                    else -> ServerListPane(state.servers, onSelect = { viewModel.selectServer(it) })
                }
            }
        }
    }
}

@Composable
private fun ServerListPane(servers: List<Server>, onSelect: (Server) -> Unit) {
    if (servers.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("📡", fontSize = 48.sp)
                Text("Sunucu yok", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text("Web panelinden bir tane ekle.", color = Gray400, fontSize = 13.sp)
            }
        }
        return
    }

    val online = servers.count { it.isActive }
    val offline = servers.size - online

    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            // Summary header
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SummaryChip(label = "Çevrimiçi", value = online.toString(), color = Green400)
                SummaryChip(label = "Çevrimdışı", value = offline.toString(), color = if (offline > 0) Red400 else Gray400)
                SummaryChip(label = "Toplam", value = servers.size.toString(), color = Brand500)
            }
            Spacer(Modifier.height(4.dp))
        }
        items(servers) { server ->
            ServerCard(server = server, onClick = { onSelect(server) })
        }
    }
}

@Composable
private fun SummaryChip(label: String, value: String, color: Color) {
    Surface(
        color = Gray900,
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.wrapContentWidth(),
    ) {
        Row(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(color))
            Column {
                Text(value, color = color, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, lineHeight = 18.sp)
                Text(label, color = Gray400, fontSize = 10.sp, lineHeight = 10.sp)
            }
        }
    }
}

@Composable
private fun ServerCard(server: Server, onClick: () -> Unit) {
    val isUp = server.isActive
    val statusColor = if (isUp) Green400 else Red400
    val score = server.healthScore
    val scoreColor = when {
        score == null -> Gray400
        score >= 70 -> Green400
        score >= 40 -> Yellow400
        else -> Red400
    }

    Surface(
        color = Gray900,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        tonalElevation = 2.dp,
    ) {
        Column {
            // Status bar
            Box(modifier = Modifier.fillMaxWidth().height(3.dp).background(statusColor))
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Status dot + info
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(statusColor))
                        Text(server.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    Text(server.url, color = Gray400, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(start = 16.dp))
                    Row(modifier = Modifier.padding(start = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatusBadge(if (isUp) "Çevrimiçi" else "Çevrimdışı", statusColor)
                        if (server.type == "INTERNAL") StatusBadge("Dahili", Color(0xFF7C3AED))
                    }
                }
                // Health score
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = score?.let { "%.0f".format(it) } ?: "—",
                        color = scoreColor,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 28.sp,
                        lineHeight = 28.sp,
                    )
                    Text("skor", color = Gray400, fontSize = 10.sp)
                }
            }
        }
    }
}

@Composable
private fun StatusBadge(text: String, color: Color) {
    Surface(
        color = color.copy(alpha = 0.15f),
        shape = RoundedCornerShape(6.dp),
    ) {
        Text(text, color = color, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
    }
}

@Composable
private fun ServerDetailPane(server: Server, pingLogs: List<PingLog>, alerts: List<Alert>) {
    val isUp = server.isActive
    val score = server.healthScore
    val scoreColor = when {
        score == null -> Gray400
        score >= 70 -> Green400
        score >= 40 -> Yellow400
        else -> Red400
    }

    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Server info card
        item {
            Surface(color = Gray900, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                Column {
                    Box(modifier = Modifier.fillMaxWidth().height(3.dp).background(if (isUp) Green400 else Red400))
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(if (isUp) Green400 else Red400))
                                StatusBadge(if (isUp) "Çevrimiçi" else "Çevrimdışı", if (isUp) Green400 else Red400)
                            }
                            Text(server.url, color = Gray400, fontSize = 12.sp)
                            server.threshold?.let {
                                Text("Eşik: ${it}ms", color = Gray400, fontSize = 12.sp)
                            }
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(score?.let { "%.0f".format(it) } ?: "—", color = scoreColor, fontWeight = FontWeight.ExtraBold, fontSize = 36.sp, lineHeight = 36.sp)
                            Text("sağlık", color = Gray400, fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Alerts section
        item {
            Text("Son Uyarılar", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
        if (alerts.isEmpty()) {
            item {
                Surface(color = Gray900, shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("✅", fontSize = 18.sp)
                        Text("Uyarı yok — her şey yolunda", color = Green400, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(alerts) { alert ->
                val (icon, color) = when (alert.type) {
                    "DOWN" -> "🔴" to Red400
                    "RECOVERED" -> "🟢" to Green400
                    "THRESHOLD_BREACH" -> "🟡" to Yellow400
                    "PREDICTED_FAILURE" -> "🤖" to Color(0xFFA78BFA)
                    else -> "ℹ️" to Gray400
                }
                val label = when (alert.type) {
                    "DOWN" -> "Çevrimdışı"
                    "RECOVERED" -> "Kurtarıldı"
                    "THRESHOLD_BREACH" -> "Yavaş"
                    "PREDICTED_FAILURE" -> "YZ Uyarısı"
                    else -> alert.type
                }
                Surface(color = Gray900, shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(icon, fontSize = 18.sp)
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(label, color = color, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(alert.message, color = Gray400, fontSize = 12.sp)
                            Text(alert.sentAt.take(19).replace("T", " "), color = Gray600, fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Ping log section
        item {
            Spacer(Modifier.height(4.dp))
            Text("Ping Geçmişi", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
        if (pingLogs.isEmpty()) {
            item {
                Text("Henüz ping kaydı yok.", color = Gray400, fontSize = 13.sp)
            }
        } else {
            items(pingLogs) { log ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(log.checkedAt.take(19).replace("T", " "), color = Gray600, fontSize = 11.sp)
                    Surface(
                        color = if (log.isUp) Green400.copy(alpha = 0.15f) else Red400.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(6.dp),
                    ) {
                        Text(
                            text = if (log.isUp) "${log.latency ?: "?"}ms" else "KAPALI",
                            color = if (log.isUp) Green400 else Red400,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        )
                    }
                }
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}
