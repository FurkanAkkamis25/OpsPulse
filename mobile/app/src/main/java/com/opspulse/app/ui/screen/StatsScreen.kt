package com.opspulse.app.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.opspulse.app.ui.viewmodel.StatsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(viewModel: StatsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsState()
    val pullState = rememberPullToRefreshState()

    if (pullState.isRefreshing) {
        LaunchedEffect(true) {
            viewModel.refresh()
            pullState.endRefresh()
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(
        Brush.verticalGradient(colors = listOf(Gray950, Color(0xFF0D1B2A), Gray900))
    )) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                    title = { Text("İstatistikler", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp) },
                )
            }
        ) { padding ->
            Box(modifier = Modifier.padding(padding).nestedScroll(pullState.nestedScrollConnection)) {
                when {
                    state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Brand500)
                    }
                    state.stats == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Veri yüklenemedi", color = Gray400)
                    }
                    else -> {
                        val stats = state.stats!!
                        val uptimePct = if (stats.totalServers > 0)
                            (stats.online.toFloat() / stats.totalServers * 100).toInt() else 0

                        Column(
                            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            // Uptime büyük gösterge
                            Surface(color = Gray900, shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth()) {
                                Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    val uptimeColor = when {
                                        uptimePct >= 90 -> Green400
                                        uptimePct >= 70 -> Yellow400
                                        else -> Red400
                                    }
                                    Box(modifier = Modifier.size(120.dp), contentAlignment = Alignment.Center) {
                                        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
                                            val stroke = androidx.compose.ui.graphics.drawscope.Stroke(10.dp.toPx(), cap = androidx.compose.ui.graphics.StrokeCap.Round)
                                            drawArc(color = Gray800, startAngle = 135f, sweepAngle = 270f, useCenter = false, style = stroke)
                                            drawArc(color = uptimeColor, startAngle = 135f, sweepAngle = uptimePct / 100f * 270f, useCenter = false, style = stroke)
                                        }
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            Text("$uptimePct%", color = uptimeColor, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp)
                                            Text("çalışma", color = Gray400, fontSize = 11.sp)
                                        }
                                    }
                                    Text("Genel Sistem Durumu", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Text("${stats.online} çevrimiçi / ${stats.totalServers} toplam sunucu", color = Gray400, fontSize = 13.sp)
                                }
                            }

                            // 2x2 istat kartları
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                StatCard(modifier = Modifier.weight(1f), label = "Çevrimiçi", value = stats.online.toString(), unit = "sunucu", color = Green400)
                                StatCard(modifier = Modifier.weight(1f), label = "Çevrimdışı", value = stats.offline.toString(), unit = "sunucu", color = if (stats.offline > 0) Red400 else Gray400)
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                StatCard(modifier = Modifier.weight(1f), label = "Ort. Sağlık", value = stats.avgHealthScore?.toString() ?: "—", unit = "/100", color = Brand500)
                                StatCard(modifier = Modifier.weight(1f), label = "Ort. Gecikme", value = stats.avgLatency?.toString() ?: "—", unit = "ms", color = Color(0xFFF59E0B))
                            }

                            // En iyi / en kötü
                            if (stats.bestServer != null || stats.worstServer != null) {
                                Surface(color = Gray900, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Text("Sunucu Sıralaması", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        stats.bestServer?.let {
                                            RankRow("🏆", "En İyi", it.name, it.healthScore, Green400)
                                        }
                                        stats.worstServer?.let {
                                            if (it.name != stats.bestServer?.name) {
                                                RankRow("⚠️", "En Kötü", it.name, it.healthScore, Red400)
                                            }
                                        }
                                    }
                                }
                            }

                            Spacer(Modifier.height(80.dp))
                        }
                    }
                }

                PullToRefreshContainer(modifier = Modifier.align(Alignment.TopCenter), state = pullState, containerColor = Gray800, contentColor = Brand500)
            }
        }
    }
}

@Composable
private fun StatCard(modifier: Modifier = Modifier, label: String, value: String, unit: String, color: Color) {
    Surface(color = Gray900, shape = RoundedCornerShape(16.dp), modifier = modifier) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(label, color = Gray400, fontSize = 11.sp, fontWeight = FontWeight.Medium)
            Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(value, color = color, fontWeight = FontWeight.ExtraBold, fontSize = 32.sp, lineHeight = 32.sp)
                Text(unit, color = Gray600, fontSize = 12.sp, modifier = Modifier.padding(bottom = 4.dp))
            }
        }
    }
}

@Composable
private fun RankRow(icon: String, rank: String, name: String, score: Double?, color: Color) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(icon, fontSize = 20.sp)
        Column(modifier = Modifier.weight(1f)) {
            Text(rank, color = Gray400, fontSize = 11.sp)
            Text(name, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
        }
        Text(score?.let { "%.0f".format(it) } ?: "—", color = color, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
    }
}
