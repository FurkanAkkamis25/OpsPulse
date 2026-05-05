package com.opspulse.app.ui.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    if (state.selectedServer != null)
                        Text(state.selectedServer!!.name)
                    else
                        Text("OpsPulse")
                },
                navigationIcon = {
                    if (state.selectedServer != null) {
                        IconButton(onClick = { viewModel.clearSelection() }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.loadServers() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                    if (state.selectedServer == null) {
                        TextButton(onClick = onLogout) { Text("Sign out") }
                    }
                },
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when {
                state.loading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                state.error != null -> Text(state.error!!, modifier = Modifier.align(Alignment.Center), color = MaterialTheme.colorScheme.error)
                state.selectedServer != null -> ServerDetailPane(state.pingLogs, state.alerts)
                else -> ServerListPane(state.servers, onSelect = { viewModel.selectServer(it) })
            }
        }
    }
}

@Composable
private fun ServerListPane(servers: List<Server>, onSelect: (Server) -> Unit) {
    if (servers.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No servers. Add one from the web dashboard.", color = Gray400)
        }
        return
    }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(servers) { server ->
            ServerRow(server = server, onClick = { onSelect(server) })
        }
    }
}

@Composable
private fun ServerRow(server: Server, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(server.name, style = MaterialTheme.typography.titleMedium)
                Text(server.url, style = MaterialTheme.typography.bodySmall, color = Gray400, maxLines = 1)
            }
            Spacer(Modifier.width(12.dp))
            val score = server.healthScore
            val color = when {
                score == null -> Gray400
                score >= 70 -> Green400
                score >= 40 -> Yellow400
                else -> Red400
            }
            Text(
                text = score?.let { "%.0f".format(it) } ?: "—",
                color = color,
                style = MaterialTheme.typography.headlineSmall,
            )
        }
    }
}

@Composable
private fun ServerDetailPane(
    pingLogs: List<com.opspulse.app.data.model.PingLog>,
    alerts: List<com.opspulse.app.data.model.Alert>,
) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            Text("Recent Alerts", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(4.dp))
        }
        if (alerts.isEmpty()) {
            item { Text("No alerts", color = Gray400, style = MaterialTheme.typography.bodySmall) }
        } else {
            items(alerts) { alert ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(12.dp)) {
                        Text(alert.type, style = MaterialTheme.typography.labelMedium, color = Red400)
                        Text(alert.message, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
        item {
            Spacer(Modifier.height(12.dp))
            Text("Ping Log", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(4.dp))
        }
        items(pingLogs) { log ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(log.checkedAt.take(19).replace("T", " "), style = MaterialTheme.typography.bodySmall, color = Gray400)
                Text(
                    text = if (log.isUp) "${log.latency ?: "?"}ms" else "DOWN",
                    style = MaterialTheme.typography.bodySmall,
                    color = if (log.isUp) Green400 else Red400,
                )
            }
        }
    }
}
