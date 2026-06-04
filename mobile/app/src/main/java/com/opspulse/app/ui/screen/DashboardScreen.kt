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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
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
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    var showAddSheet by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(
        Brush.verticalGradient(colors = listOf(Gray950, Color(0xFF0D1B2A), Gray900))
    )) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                    title = {
                        if (state.selectedServer != null)
                            Text(state.selectedServer!!.name, color = Color.White, fontWeight = FontWeight.Bold)
                        else
                            Text("Sunucular", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                    },
                    navigationIcon = {
                        if (state.selectedServer != null) {
                            IconButton(onClick = { viewModel.clearSelection() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Color.White)
                            }
                        }
                    },
                    actions = {
                        if (state.selectedServer != null) {
                            IconButton(onClick = { viewModel.deleteServer(state.selectedServer!!.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Sil", tint = Red400)
                            }
                        }
                    }
                )
            },
            floatingActionButton = {
                if (state.selectedServer == null) {
                    FloatingActionButton(
                        onClick = { showAddSheet = true },
                        containerColor = Brand500,
                        contentColor = Color.White,
                        shape = CircleShape,
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Sunucu ekle")
                    }
                }
            }
        ) { padding ->
            Box(modifier = Modifier.padding(padding).fillMaxSize()) {
                when {
                    state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Brand500)
                    }
                    state.selectedServer != null -> ServerDetailPane(
                        state.selectedServer!!,
                        state.pingLogs,
                        state.alerts,
                    )
                    else -> ServerListPane(
                        servers = state.servers,
                        refreshing = state.refreshing,
                        onSelect = { viewModel.selectServer(it) },
                        onRefresh = { viewModel.refresh() },
                    )
                }
            }
        }

        if (showAddSheet) {
            AddServerSheet(
                onAdd = { name, url, type ->
                    viewModel.addServer(name, url, type)
                    showAddSheet = false
                },
                onDismiss = { showAddSheet = false },
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ServerListPane(
    servers: List<Server>,
    refreshing: Boolean,
    onSelect: (Server) -> Unit,
    onRefresh: () -> Unit,
) {
    val pullState = rememberPullToRefreshState()

    if (pullState.isRefreshing) {
        LaunchedEffect(true) {
            onRefresh()
            pullState.endRefresh()
        }
    }

    Box(modifier = Modifier.nestedScroll(pullState.nestedScrollConnection)) {
        if (servers.isEmpty() && !refreshing) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("📡", fontSize = 48.sp)
                    Text("Sunucu yok", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text("Sağ alttaki + butonuna bas.", color = Gray400, fontSize = 13.sp)
                }
            }
        } else {
            val online = servers.count { it.isActive }
            val offline = servers.size - online

            LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        SummaryChip("Çevrimiçi", online.toString(), Green400)
                        SummaryChip("Çevrimdışı", offline.toString(), if (offline > 0) Red400 else Gray400)
                        SummaryChip("Toplam", servers.size.toString(), Brand500)
                    }
                    Spacer(Modifier.height(4.dp))
                }
                items(servers) { server ->
                    ServerCard(server = server, onClick = { onSelect(server) })
                }
            }
        }

        PullToRefreshContainer(
            modifier = Modifier.align(Alignment.TopCenter),
            state = pullState,
            containerColor = Gray800,
            contentColor = Brand500,
        )
    }
}

@Composable
private fun SummaryChip(label: String, value: String, color: Color) {
    Surface(color = Gray900, shape = RoundedCornerShape(12.dp)) {
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
fun ServerCard(server: Server, onClick: () -> Unit) {
    val isUp = server.isActive
    val statusColor = if (isUp) Green400 else Red400
    val score = server.healthScore

    Surface(color = Gray900, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth().clickable(onClick = onClick), tonalElevation = 2.dp) {
        Column {
            Box(modifier = Modifier.fillMaxWidth().height(3.dp).background(statusColor))
            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(statusColor))
                        Text(server.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    Text(server.url, color = Gray400, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(start = 16.dp))
                    Row(modifier = Modifier.padding(start = 16.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        StatusBadge(if (isUp) "Çevrimiçi" else "Çevrimdışı", statusColor)
                        if (server.type == "INTERNAL") StatusBadge("Dahili", Color(0xFF7C3AED))
                    }
                }
                Spacer(Modifier.width(12.dp))
                HealthGauge(score = score)
            }
        }
    }
}

@Composable
fun HealthGauge(score: Double?) {
    val scoreColor = when {
        score == null -> Gray600
        score >= 70 -> Green400
        score >= 40 -> Yellow400
        else -> Red400
    }
    Box(modifier = Modifier.size(52.dp), contentAlignment = Alignment.Center) {
        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
            val strokeWidth = 5.dp.toPx()
            val sweepAngle = ((score ?: 0.0) / 100.0 * 270.0).toFloat()
            drawArc(color = Gray800, startAngle = 135f, sweepAngle = 270f, useCenter = false, style = Stroke(strokeWidth, cap = StrokeCap.Round))
            if (score != null) {
                drawArc(color = scoreColor, startAngle = 135f, sweepAngle = sweepAngle, useCenter = false, style = Stroke(strokeWidth, cap = StrokeCap.Round))
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(score?.let { "%.0f".format(it) } ?: "—", color = scoreColor, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, lineHeight = 14.sp)
            if (score != null) Text("skor", color = Gray600, fontSize = 8.sp, lineHeight = 8.sp)
        }
    }
}

@Composable
fun StatusBadge(text: String, color: Color) {
    Surface(color = color.copy(alpha = 0.15f), shape = RoundedCornerShape(6.dp)) {
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
        item {
            Surface(color = Gray900, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                Column {
                    Box(modifier = Modifier.fillMaxWidth().height(3.dp).background(if (isUp) Green400 else Red400))
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            StatusBadge(if (isUp) "Çevrimiçi" else "Çevrimdışı", if (isUp) Green400 else Red400)
                            Text(server.url, color = Gray400, fontSize = 12.sp)
                            server.threshold?.let { Text("Eşik: ${it}ms", color = Gray400, fontSize = 12.sp) }
                        }
                        HealthGauge(score = score)
                    }
                }
            }
        }

        item { Text("Son Uyarılar", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp) }

        if (alerts.isEmpty()) {
            item {
                Surface(color = Gray900, shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.padding(14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("✅", fontSize = 18.sp)
                        Text("Uyarı yok", color = Green400, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(alerts) { alert -> AlertCard(alert.type, alert.message, alert.sentAt) }
        }

        item {
            Spacer(Modifier.height(4.dp))
            Text("Ping Geçmişi", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }

        items(pingLogs) { log ->
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(log.checkedAt.take(19).replace("T", " "), color = Gray600, fontSize = 11.sp)
                Surface(color = if (log.isUp) Green400.copy(alpha = 0.15f) else Red400.copy(alpha = 0.15f), shape = RoundedCornerShape(6.dp)) {
                    Text(
                        text = if (log.isUp) "${log.latency ?: "?"}ms" else "KAPALI",
                        color = if (log.isUp) Green400 else Red400,
                        fontSize = 11.sp, fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                    )
                }
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
fun AlertCard(type: String, message: String, sentAt: String) {
    val (icon, color, label) = when (type) {
        "DOWN" -> Triple("🔴", Red400, "Çevrimdışı")
        "RECOVERED" -> Triple("🟢", Green400, "Kurtarıldı")
        "THRESHOLD_BREACH" -> Triple("🟡", Yellow400, "Yavaş")
        "PREDICTED_FAILURE" -> Triple("🤖", Color(0xFFA78BFA), "YZ Uyarısı")
        else -> Triple("ℹ️", Gray400, type)
    }
    Surface(color = Gray900, shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(icon, fontSize = 18.sp)
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(label, color = color, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Text(message, color = Gray400, fontSize = 12.sp)
                Text(sentAt.take(19).replace("T", " "), color = Gray600, fontSize = 11.sp)
            }
        }
    }
}
