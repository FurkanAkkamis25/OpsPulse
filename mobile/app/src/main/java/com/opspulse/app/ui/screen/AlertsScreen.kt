package com.opspulse.app.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.opspulse.app.ui.theme.*
import com.opspulse.app.ui.viewmodel.AlertsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertsScreen(viewModel: AlertsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsState()
    val pullState = rememberPullToRefreshState()

    if (pullState.isRefreshing) {
        LaunchedEffect(true) {
            viewModel.refresh()
            pullState.endRefresh()
        }
    }

    val filters = listOf(
        null to "Tümü",
        "DOWN" to "🔴 Çevrimdışı",
        "RECOVERED" to "🟢 Kurtarıldı",
        "THRESHOLD_BREACH" to "🟡 Yavaş",
        "PREDICTED_FAILURE" to "🤖 YZ",
    )

    Box(modifier = Modifier.fillMaxSize().background(
        Brush.verticalGradient(colors = listOf(Gray950, Color(0xFF0D1B2A), Gray900))
    )) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                    title = { Text("Uyarılar", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp) },
                )
            }
        ) { padding ->
            Box(modifier = Modifier.padding(padding).nestedScroll(pullState.nestedScrollConnection)) {
                Column {
                    // Filter chips
                    LazyRow(contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(filters) { (type, label) ->
                            val selected = state.filter == type
                            FilterChip(
                                selected = selected,
                                onClick = { viewModel.setFilter(type) },
                                label = { Text(label, fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Brand500.copy(alpha = 0.2f),
                                    selectedLabelColor = Brand500,
                                    containerColor = Gray900,
                                    labelColor = Gray400,
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = selected,
                                    selectedBorderColor = Brand500,
                                    borderColor = Gray800,
                                ),
                            )
                        }
                    }

                    when {
                        state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = Brand500)
                        }
                        state.alerts.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("✅", fontSize = 48.sp)
                                Text("Uyarı yok", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                Text("Her şey yolunda.", color = Gray400, fontSize = 13.sp)
                            }
                        }
                        else -> LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(state.alerts) { alert ->
                                Surface(color = Gray900, shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                                    Row(modifier = Modifier.padding(14.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        val (icon, color, label) = when (alert.type) {
                                            "DOWN" -> Triple("🔴", Red400, "Çevrimdışı")
                                            "RECOVERED" -> Triple("🟢", Green400, "Kurtarıldı")
                                            "THRESHOLD_BREACH" -> Triple("🟡", Yellow400, "Yavaş")
                                            "PREDICTED_FAILURE" -> Triple("🤖", Color(0xFFA78BFA), "YZ Uyarısı")
                                            else -> Triple("ℹ️", Gray400, alert.type)
                                        }
                                        Text(icon, fontSize = 20.sp)
                                        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                                Text(label, color = color, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                                Surface(color = Gray800, shape = RoundedCornerShape(4.dp)) {
                                                    Text(alert.server.name, color = Gray400, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                                }
                                            }
                                            Text(alert.message, color = Color.White, fontSize = 12.sp)
                                            Text(alert.sentAt.take(19).replace("T", " "), color = Gray600, fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                PullToRefreshContainer(modifier = Modifier.align(Alignment.TopCenter), state = pullState, containerColor = Gray800, contentColor = Brand500)
            }
        }
    }
}
