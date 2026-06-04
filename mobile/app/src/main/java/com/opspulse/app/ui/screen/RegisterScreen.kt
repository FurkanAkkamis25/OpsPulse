package com.opspulse.app.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.opspulse.app.ui.theme.Brand500
import com.opspulse.app.ui.theme.Gray400
import com.opspulse.app.ui.theme.Gray600
import com.opspulse.app.ui.theme.Gray800
import com.opspulse.app.ui.theme.Gray900
import com.opspulse.app.ui.theme.Gray950
import com.opspulse.app.ui.viewmodel.AuthState
import com.opspulse.app.ui.viewmodel.AuthViewModel

@Composable
fun RegisterScreen(
    onSuccess: () -> Unit,
    onLoginClick: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        if (state is AuthState.Success) onSuccess()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Gray950, Color(0xFF0D1B2A), Gray900)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 28.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.linearGradient(colors = listOf(Brand500, Color(0xFF7C3AED)))
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text("OP", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 24.sp)
            }
            Spacer(Modifier.height(20.dp))
            Text("Hesap oluştur", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(6.dp))
            Text("2 dakikadan kısa sürede izlemeye başla", color = Gray400, fontSize = 14.sp, textAlign = TextAlign.Center)
            Spacer(Modifier.height(40.dp))

            if (state is AuthState.Error) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFF3B0A0A),
                    shape = RoundedCornerShape(12.dp),
                    tonalElevation = 0.dp,
                ) {
                    Text(
                        (state as AuthState.Error).message,
                        color = Color(0xFFF87171),
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(12.dp),
                    )
                }
                Spacer(Modifier.height(12.dp))
            }

            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Gray900,
                shape = RoundedCornerShape(20.dp),
                tonalElevation = 2.dp,
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    val fieldColors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedContainerColor = Gray800,
                        unfocusedContainerColor = Gray800,
                        focusedBorderColor = Brand500,
                        unfocusedBorderColor = Gray600,
                        focusedLabelColor = Brand500,
                        unfocusedLabelColor = Gray400,
                        cursorColor = Brand500,
                    )
                    OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Ad Soyad") },
                        singleLine = true, modifier = Modifier.fillMaxWidth(), colors = fieldColors, shape = RoundedCornerShape(12.dp))
                    OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("E-posta") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true, modifier = Modifier.fillMaxWidth(), colors = fieldColors, shape = RoundedCornerShape(12.dp))
                    OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Şifre") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true, modifier = Modifier.fillMaxWidth(), colors = fieldColors, shape = RoundedCornerShape(12.dp))
                    Button(
                        onClick = { viewModel.register(name, email, password) },
                        enabled = state !is AuthState.Loading,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Brand500),
                    ) {
                        if (state is AuthState.Loading)
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = Color.White)
                        else
                            Text("Kayıt ol", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }

            Spacer(Modifier.height(24.dp))
            TextButton(onClick = onLoginClick) {
                Text("Zaten hesabın var mı? ", color = Gray400, fontSize = 13.sp)
                Text("Giriş yap", color = Brand500, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
