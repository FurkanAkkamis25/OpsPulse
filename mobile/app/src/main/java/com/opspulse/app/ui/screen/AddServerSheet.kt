package com.opspulse.app.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.opspulse.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddServerSheet(
    onAdd: (name: String, url: String, type: String) -> Unit,
    onDismiss: () -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var url by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("EXTERNAL") }
    var error by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Gray900,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp),
    ) {
        Column(modifier = Modifier.padding(start = 24.dp, end = 24.dp, bottom = 40.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("Sunucu Ekle", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)

            // Type toggle
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                listOf("EXTERNAL" to "🌐 Harici", "INTERNAL" to "🔒 Dahili").forEach { (t, label) ->
                    val selected = type == t
                    Surface(
                        onClick = { type = t },
                        color = if (selected) Brand500.copy(alpha = 0.2f) else Gray800,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f),
                    ) {
                        Text(
                            label, color = if (selected) Brand500 else Gray400,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(vertical = 12.dp, horizontal = 8.dp),
                        )
                    }
                }
            }

            val fieldColors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                focusedContainerColor = Gray800, unfocusedContainerColor = Gray800,
                focusedBorderColor = Brand500, unfocusedBorderColor = Gray600,
                focusedLabelColor = Brand500, unfocusedLabelColor = Gray400,
                cursorColor = Brand500,
            )

            OutlinedTextField(
                value = name, onValueChange = { name = it },
                label = { Text("İsim") },
                placeholder = { Text("Canlı API", color = Gray600) },
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                colors = fieldColors, shape = RoundedCornerShape(12.dp),
            )

            OutlinedTextField(
                value = url, onValueChange = { url = it },
                label = { Text("URL") },
                placeholder = { Text("https://api.example.com/health", color = Gray600) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                singleLine = true, modifier = Modifier.fillMaxWidth(),
                colors = fieldColors, shape = RoundedCornerShape(12.dp),
            )

            if (error.isNotEmpty()) {
                Text(error, color = Red400, fontSize = 12.sp)
            }

            Button(
                onClick = {
                    if (name.isBlank()) { error = "İsim boş bırakılamaz"; return@Button }
                    if (url.isBlank()) { error = "URL boş bırakılamaz"; return@Button }
                    onAdd(name.trim(), url.trim(), type)
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Brand500),
            ) {
                Text("Ekle", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
    }
}
