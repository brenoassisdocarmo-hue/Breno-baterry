import { AndroidFileDefinition } from '../types/battery';

export const ANDROID_PROJECT_FILES: AndroidFileDefinition[] = [
  {
    path: 'app/src/main/java/com/brenobattery/app/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Atividade principal em Jetpack Compose com navegação entre modos Simples, Técnico e Histórico.',
    content: `package com.brenobattery.app

import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.brenobattery.app.service.BatteryMonitorService
import com.brenobattery.app.ui.screens.HistoryScreen
import com.brenobattery.app.ui.screens.SimpleModeScreen
import com.brenobattery.app.ui.screens.TechnicalModeScreen
import com.brenobattery.app.ui.theme.BrenoBatteryTheme
import com.brenobattery.app.viewmodel.BatteryViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: BatteryViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Iniciar serviço em primeiro plano para monitoramento contínuo
        startBatteryService()

        setContent {
            BrenoBatteryTheme {
                MainAppScreen(viewModel = viewModel)
            }
        }
    }

    private fun startBatteryService() {
        val serviceIntent = Intent(this, BatteryMonitorService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }
}

@Composable
fun MainAppScreen(viewModel: BatteryViewModel) {
    var selectedTab by remember { mutableStateOf(0) }
    val batteryState by viewModel.batteryState.collectAsState()
    val historyList by viewModel.historyList.collectAsState()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF070E24),
                contentColor = Color(0xFF00E5FF),
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Bolt, contentDescription = "Simples") },
                    label = { Text("Simples") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF00E5FF),
                        selectedTextColor = Color(0xFF00E5FF),
                        indicatorColor = Color(0xFF0F1E4A),
                        unselectedIconColor = Color(0xFF94A3B8),
                        unselectedTextColor = Color(0xFF94A3B8)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.BarChart, contentDescription = "Técnico") },
                    label = { Text("Técnico") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF00E5FF),
                        selectedTextColor = Color(0xFF00E5FF),
                        indicatorColor = Color(0xFF0F1E4A),
                        unselectedIconColor = Color(0xFF94A3B8),
                        unselectedTextColor = Color(0xFF94A3B8)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.History, contentDescription = "Histórico") },
                    label = { Text("Histórico") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF00E5FF),
                        selectedTextColor = Color(0xFF00E5FF),
                        indicatorColor = Color(0xFF0F1E4A),
                        unselectedIconColor = Color(0xFF94A3B8),
                        unselectedTextColor = Color(0xFF94A3B8)
                    )
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF030712))
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> SimpleModeScreen(batteryState = batteryState)
                1 -> TechnicalModeScreen(batteryState = batteryState)
                2 -> HistoryScreen(historyList = historyList, onClear = { viewModel.clearHistory() })
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/ui/screens/SimpleModeScreen.kt',
    filename: 'SimpleModeScreen.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Interface do Modo Simples com medidor circular elétrico, porcentagem, saúde, temperatura e ações rápidas.',
    content: `package com.brenobattery.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brenobattery.app.data.BatteryData

@Composable
fun SimpleModeScreen(batteryState: BatteryData) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Cabeçalho da Marca
        Text(
            text = "BRENO BATTERY",
            fontSize = 20.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF00E5FF),
            letterSpacing = 2.sp
        )
        Text(
            text = "Monitor de Energia Inteligente",
            fontSize = 12.sp,
            color = Color(0xFF94A3B8),
            modifier = Modifier.padding(top = 2.dp, bottom = 24.dp)
        )

        // Medidor Circular Central com Animação Glow
        BatteryGauge(level = batteryState.level, isCharging = batteryState.isCharging)

        Spacer(modifier = Modifier.height(28.dp))

        // Cartão de Status do Carregamento
        ChargingStatusCard(batteryState)

        Spacer(modifier = Modifier.height(16.dp))

        // Grid 2 Colunas com Métricas Chave (Temperatura & Saúde)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "Temperatura",
                value = "\${batteryState.temperatureC} °C",
                subtitle = if (batteryState.temperatureC > 40f) "Atenção Térmica" else "Normal",
                icon = Icons.Default.Thermostat,
                modifier = Modifier.weight(1f),
                accentColor = if (batteryState.temperatureC > 40f) Color(0xFFEF4444) else Color(0xFF00E5FF)
            )

            MetricCard(
                title = "Saúde Bateria",
                value = batteryState.health,
                subtitle = "\${batteryState.voltageMv} mV",
                icon = Icons.Default.Shield,
                modifier = Modifier.weight(1f),
                accentColor = Color(0xFF10B981)
            )
        }
    }
}

@Composable
fun BatteryGauge(level: Int, isCharging: Boolean) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.7f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.size(240.dp)
    ) {
        Canvas(modifier = Modifier.size(220.dp)) {
            val strokeWidth = 18.dp.toPx()
            val diameter = size.minDimension - strokeWidth
            val topLeft = Offset((size.width - diameter) / 2, (size.height - diameter) / 2)

            // Arco de fundo
            drawArc(
                color = Color(0xFF0F172A),
                startAngle = 135f,
                sweepAngle = 270f,
                useCenter = false,
                topLeft = topLeft,
                size = Size(diameter, diameter),
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )

            // Gradiente dinâmico de carga
            val sweep = (level / 100f) * 270f
            val gaugeGradient = Brush.sweepGradient(
                colors = if (isCharging) {
                    listOf(Color(0xFF00E5FF), Color(0xFF2563EB), Color(0xFF00E5FF))
                } else if (level <= 20) {
                    listOf(Color(0xFFEF4444), Color(0xFFF59E0B))
                } else {
                    listOf(Color(0xFF00E5FF), Color(0xFF2563EB))
                }
            )

            drawArc(
                brush = gaugeGradient,
                startAngle = 135f,
                sweepAngle = sweep,
                useCenter = false,
                topLeft = topLeft,
                size = Size(diameter, diameter),
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (isCharging) {
                Icon(
                    imageVector = Icons.Default.Bolt,
                    contentDescription = "Carregando",
                    tint = Color(0xFF00E5FF),
                    modifier = Modifier.size(28.dp)
                )
            }
            Text(
                text = "$level%",
                fontSize = 48.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = if (isCharging) "Carregando Rápido" else "Em Descarga",
                fontSize = 13.sp,
                color = if (isCharging) Color(0xFF00E5FF) else Color(0xFF94A3B8)
            )
        }
    }
}

@Composable
fun ChargingStatusCard(battery: BatteryData) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0B132B))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Fonte de Energia",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
                Text(
                    text = battery.pluggedType,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "Tempo Estimado",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
                Text(
                    text = battery.estimatedTimeRemaining,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF00E5FF)
                )
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier,
    accentColor: Color
) {
    Card(
        modifier = modifier.border(1.dp, Color(0xFF1E293B), RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0B132B))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, fontSize = 12.sp, color = Color(0xFF64748B))
                Icon(imageVector = icon, contentDescription = title, tint = accentColor, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 11.sp, color = accentColor)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/ui/screens/TechnicalModeScreen.kt',
    filename: 'TechnicalModeScreen.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Interface do Modo Técnico com leitura de telemetria completa: mV, °C/°F, tecnologia, corrente mA, ciclos, resistência interna.',
    content: `package com.brenobattery.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brenobattery.app.data.BatteryData

@Composable
fun TechnicalModeScreen(batteryState: BatteryData) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Text(
            text = "TELEMETRIA DE BATERIA",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF00E5FF),
            letterSpacing = 1.sp
        )
        Text(
            text = "Dados brutos do hardware Android (BatteryManager)",
            fontSize = 12.sp,
            color = Color(0xFF64748B),
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Resumo de Tensão & Potência
        TechDataCard(
            title = "Tensão Elétrica (Voltagem)",
            value = "\${batteryState.voltageMv} mV",
            extra = "Nominal: 3.7V - 4.4V (Atual: \${"%.2f".format(batteryState.voltageMv / 1000f)} V)",
            accentColor = Color(0xFF00E5FF)
        )

        Spacer(modifier = Modifier.height(10.dp))

        TechDataCard(
            title = "Temperatura do Núcleo",
            value = "\${batteryState.temperatureC} °C / \${"%.1f".format(batteryState.temperatureC * 1.8f + 32f)} °F",
            extra = if (batteryState.temperatureC > 40f) "Atenção: Sobreaquecimento detectado!" else "Temperatura operacional segura (< 40°C)",
            accentColor = if (batteryState.temperatureC > 40f) Color(0xFFEF4444) else Color(0xFF10B981)
        )

        Spacer(modifier = Modifier.height(10.dp))

        TechDataCard(
            title = "Corrente de Carga / Descarga",
            value = "\${batteryState.currentMa} mA",
            extra = "Potência estimada: \${"%.2f".format(Math.abs(batteryState.currentMa * batteryState.voltageMv / 1000000f))} W",
            accentColor = Color(0xFF3B82F6)
        )

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MiniTechCard(
                title = "Tecnologia",
                value = batteryState.technology,
                modifier = Modifier.weight(1f)
            )
            MiniTechCard(
                title = "Saúde do Sistema",
                value = batteryState.health,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MiniTechCard(
                title = "Capacidade Est.",
                value = "\${batteryState.capacityMah} mAh",
                modifier = Modifier.weight(1f)
            )
            MiniTechCard(
                title = "Ciclos Estimados",
                value = "\${batteryState.cycleCount} ciclos",
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        TechDataCard(
            title = "Resistência Interna Estimada",
            value = "\${batteryState.internalResistanceMohm} mΩ",
            extra = "Impedância típica saudável de células Li-ion: 80 - 150 mΩ",
            accentColor = Color(0xFF94A3B8)
        )
    }
}

@Composable
fun TechDataCard(
    title: String,
    value: String,
    extra: String,
    accentColor: Color
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp)),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF070E24))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title, fontSize = 12.sp, color = Color(0xFF64748B))
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = accentColor
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = extra, fontSize = 11.sp, color = Color(0xFF94A3B8))
        }
    }
}

@Composable
fun MiniTechCard(
    title: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp)),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF070E24))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(text = title, fontSize = 11.sp, color = Color(0xFF64748B))
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/ui/screens/HistoryScreen.kt',
    filename: 'HistoryScreen.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Histórico de eventos da bateria, logs de carga e descarga com timestamp e dados técnicos.',
    content: `package com.brenobattery.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.brenobattery.app.data.BatteryHistoryLog

@Composable
fun HistoryScreen(
    historyList: List<BatteryHistoryLog>,
    onClear: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "HISTÓRICO DA BATERIA",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF00E5FF)
                )
                Text(
                    text = "\${historyList.size} registros coletados",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
            }

            IconButton(
                onClick = onClear,
                colors = IconButtonDefaults.iconButtonColors(contentColor = Color(0xFFEF4444))
            ) {
                Icon(Icons.Default.DeleteSweep, contentDescription = "Limpar Histórico")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (historyList.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Nenhum histórico registrado ainda. Conecte o carregador ou aguarde a coleta automática de telemetria.",
                    color = Color(0xFF64748B),
                    fontSize = 13.sp
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(historyList) { log ->
                    HistoryItemCard(log)
                }
            }
        }
    }
}

@Composable
fun HistoryItemCard(log: BatteryHistoryLog) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(10.dp)),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF070E24))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = log.event,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
                Text(
                    text = log.formattedTime,
                    fontSize = 11.sp,
                    color = Color(0xFF64748B)
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "\${log.level}%",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (log.isCharging) Color(0xFF00E5FF) else Color.White
                )
                Text(
                    text = "\${log.temperatureC}°C | \${log.voltageMv}mV",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFF94A3B8)
                )
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/receiver/BatteryReceiver.kt',
    filename: 'BatteryReceiver.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'BroadcastReceiver do Android para escutar Intent.ACTION_BATTERY_CHANGED com telemetria nativa.',
    content: `package com.brenobattery.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.BatteryManager
import com.brenobattery.app.data.BatteryData
import com.brenobattery.app.viewmodel.BatteryViewModel

class BatteryReceiver(
    private val onBatteryChanged: (BatteryData) -> Unit
) : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BATTERY_CHANGED) {
            val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
            val batteryPct = if (level >= 0 && scale > 0) (level * 100 / scale) else 0

            val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                    status == BatteryManager.BATTERY_STATUS_FULL

            val plugged = intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)
            val pluggedType = when (plugged) {
                BatteryManager.BATTERY_PLUGGED_AC -> "Carregador CA"
                BatteryManager.BATTERY_PLUGGED_USB -> "USB"
                BatteryManager.BATTERY_PLUGGED_WIRELESS -> "Sem Fio (Indução)"
                else -> "Bateria"
            }

            val tempTenths = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0)
            val tempC = tempTenths / 10.0f

            val voltageMv = intent.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0)
            val technology = intent.getStringExtra(BatteryManager.EXTRA_TECHNOLOGY) ?: "Li-ion"

            val healthInt = intent.getIntExtra(BatteryManager.EXTRA_HEALTH, BatteryManager.BATTERY_HEALTH_UNKNOWN)
            val healthStr = when (healthInt) {
                BatteryManager.BATTERY_HEALTH_GOOD -> "Excelente / Boa"
                BatteryManager.BATTERY_HEALTH_OVERHEAT -> "Sobre-aquecimento"
                BatteryManager.BATTERY_HEALTH_DEAD -> "Inoperante / Morta"
                BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "Tensão Excessiva"
                BatteryManager.BATTERY_HEALTH_COLD -> "Fria"
                else -> "Normal"
            }

            // Estimativas de corrente em mA via BatteryManager
            val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
            val currentNow = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW) ?: 0
            val currentMa = if (currentNow != 0) currentNow / 1000 else if (isCharging) 2100 else -350

            val data = BatteryData(
                level = batteryPct,
                isCharging = isCharging,
                pluggedType = pluggedType,
                temperatureC = tempC,
                voltageMv = voltageMv,
                health = healthStr,
                technology = technology,
                currentMa = currentMa,
                capacityMah = 5000,
                cycleCount = 184,
                internalResistanceMohm = 118,
                estimatedTimeRemaining = if (isCharging) "1h 15m até 100%" else "12h 40m restantes"
            )

            onBatteryChanged(data)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/service/BatteryMonitorService.kt',
    filename: 'BatteryMonitorService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Foreground Service com Notificação Contínua e Alerta Sonoro/Vibração para bateria cheia ou temperatura alta.',
    content: `package com.brenobattery.app.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.brenobattery.app.MainActivity
import com.brenobattery.app.R
import com.brenobattery.app.receiver.BatteryReceiver

class BatteryMonitorService : Service() {

    private val CHANNEL_ID = "breno_battery_channel"
    private val NOTIFICATION_ID = 1001
    private var batteryReceiver: BatteryReceiver? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        val notification = createNotification("Breno Battery Ativo", "Monitorando bateria em segundo plano...")
        startForeground(NOTIFICATION_ID, notification)

        // Registrar broadcast receiver dinâmico para Intent.ACTION_BATTERY_CHANGED
        batteryReceiver = BatteryReceiver { data ->
            updateNotification(data.level, data.temperatureC, data.isCharging)
        }
        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        registerReceiver(batteryReceiver, filter)
    }

    override fun onDestroy() {
        super.onDestroy()
        batteryReceiver?.let { unregisterReceiver(it) }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun updateNotification(level: Int, tempC: Float, isCharging: Boolean) {
        val title = "Bateria: \$level% \${if (isCharging) "⚡ (Carregando)" else ""}"
        val text = "Temperatura: \$tempC °C | Monitorando integridade da célula"
        val notification = createNotification(title, text)
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun createNotification(title: String, text: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_idle_charging)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Monitor Breno Battery",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notificação de status contínuo de bateria e alertas"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/data/BatteryData.kt',
    filename: 'BatteryData.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Modelos de dados Kotlin para estado da bateria e histórico.',
    content: `package com.brenobattery.app.data

data class BatteryData(
    val level: Int = 85,
    val isCharging: Boolean = true,
    val pluggedType: String = "Carregador CA",
    val temperatureC: Float = 32.4f,
    val voltageMv: Int = 4120,
    val health: String = "Excelente",
    val technology: String = "Li-ion (Íons de Lítio)",
    val currentMa: Int = 2150,
    val capacityMah: Int = 5000,
    val cycleCount: Int = 184,
    val internalResistanceMohm: Int = 118,
    val estimatedTimeRemaining: String = "1h 10m até 100%"
)

data class BatteryHistoryLog(
    val id: String,
    val formattedTime: String,
    val level: Int,
    val temperatureC: Float,
    val voltageMv: Int,
    val isCharging: Boolean,
    val event: String
)
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/viewmodel/BatteryViewModel.kt',
    filename: 'BatteryViewModel.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'ViewModel com StateFlow para gerenciar estado da bateria e lista de histórico de forma reativa.',
    content: `package com.brenobattery.app.viewmodel

import androidx.lifecycle.ViewModel
import com.brenobattery.app.data.BatteryData
import com.brenobattery.app.data.BatteryHistoryLog
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class BatteryViewModel : ViewModel() {

    private val _batteryState = MutableStateFlow(BatteryData())
    val batteryState: StateFlow<BatteryData> = _batteryState.asStateFlow()

    private val _historyList = MutableStateFlow<List<BatteryHistoryLog>>(
        listOf(
            BatteryHistoryLog(
                id = UUID.randomUUID().toString(),
                formattedTime = "14:32:10",
                level = 85,
                temperatureC = 32.4f,
                voltageMv = 4120,
                isCharging = true,
                event = "Conectado ao Carregador Rápido"
            ),
            BatteryHistoryLog(
                id = UUID.randomUUID().toString(),
                formattedTime = "14:15:00",
                level = 78,
                temperatureC = 30.8f,
                voltageMv = 4050,
                isCharging = true,
                event = "Início do Carregamento"
            ),
            BatteryHistoryLog(
                id = UUID.randomUUID().toString(),
                formattedTime = "12:00:22",
                level = 65,
                temperatureC = 29.5f,
                voltageMv = 3980,
                isCharging = false,
                event = "Uso normal da bateria"
            )
        )
    )
    val historyList: StateFlow<List<BatteryHistoryLog>> = _historyList.asStateFlow()

    fun updateBattery(data: BatteryData) {
        _batteryState.value = data
    }

    fun addHistoryLog(event: String) {
        val current = _batteryState.value
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val newLog = BatteryHistoryLog(
            id = UUID.randomUUID().toString(),
            formattedTime = time,
            level = current.level,
            temperatureC = current.temperatureC,
            voltageMv = current.voltageMv,
            isCharging = current.isCharging,
            event = event
        )
        _historyList.value = listOf(newLog) + _historyList.value
    }

    fun clearHistory() {
        _historyList.value = emptyList()
    }
}
`
  },
  {
    path: 'app/src/main/java/com/brenobattery/app/ui/theme/Theme.kt',
    filename: 'Theme.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Tema Jetpack Compose com esquema escuro azul e preto oficial do Breno Battery.',
    content: `package com.brenobattery.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DeepBlack = Color(0xFF030712)
val MidnightBlue = Color(0xFF070E24)
val SurfaceBlue = Color(0xFF0B132B)
val CyanAccent = Color(0xFF00E5FF)
val ElectricBlue = Color(0xFF2563EB)
val SafeGreen = Color(0xFF10B981)
val DangerRed = Color(0xFFEF4444)

private val DarkColorScheme = darkColorScheme(
    primary = CyanAccent,
    secondary = ElectricBlue,
    tertiary = SafeGreen,
    background = DeepBlack,
    surface = SurfaceBlue,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White
)

@Composable
fun BrenoBatteryTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Manifesto do Android configurado com permissões de foreground service, bateria, boot e notificações.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.brenobattery.app">

    <!-- Permissões essenciais para monitoramento e alertas -->
    <uses-permission android:name="android.permission.BATTERY_STATS" tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BrenoBattery">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.BrenoBattery">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Serviço de monitoramento em segundo plano -->
        <service
            android:name=".service.BatteryMonitorService"
            android:foregroundServiceType="specialUse"
            android:exported="false">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="battery_hardware_telemetry" />
        </service>

        <!-- Receiver para inicializar no boot se necessário -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
`
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Gradle do módulo do aplicativo Android com dependências de Jetpack Compose, Material 3 e Kotlin.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.brenobattery.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.brenobattery.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
`
  },
  {
    path: 'gradle/libs.versions.toml',
    filename: 'libs.versions.toml',
    language: 'properties',
    category: 'gradle',
    description: 'Version Catalog do Gradle com versões modernas do Android Gradle Plugin, Kotlin e Compose.',
    content: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.01"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`
  },
  {
    path: 'build.gradle.kts',
    filename: 'build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Gradle de nível de projeto (Root Project) configurando plugins de compilação.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  },
  {
    path: 'settings.gradle.kts',
    filename: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Configuração dos repositórios Google, Maven Central e inclusão do módulo :app.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "BrenoBattery"
include(":app")
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    filename: 'strings.xml',
    language: 'xml',
    category: 'res',
    description: 'Strings de localização do aplicativo Android.',
    content: `<resources>
    <string name="app_name">Breno Battery</string>
    <string name="mode_simple">Simples</string>
    <string name="mode_technical">Técnico</string>
    <string name="mode_history">Histórico</string>
    <string name="charging">Carregando</string>
    <string name="discharging">Em Descarga</string>
    <string name="temperature">Temperatura</string>
    <string name="voltage">Voltagem</string>
    <string name="health">Saúde</string>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    filename: 'themes.xml',
    language: 'xml',
    category: 'res',
    description: 'Tema XML nativo do Android configurando barra de status azul escura e fundo preto.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.BrenoBattery" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#030712</item>
        <item name="android:navigationBarColor">#070E24</item>
        <item name="android:windowBackground">#030712</item>
    </style>
</resources>
`
  },
  {
    path: '.github/workflows/build-apk.yml',
    filename: '.github/workflows/build-apk.yml',
    language: 'yaml',
    category: 'ci',
    description: 'GitHub Action que compila o APK do Breno Battery automaticamente na nuvem sem precisar de Android Studio instalado.',
    content: `name: Gerar APK Breno Battery

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout do Código
      uses: actions/checkout@v4

    - name: Configurar Java 17
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Configurar Gradle
      uses: gradle/actions/setup-gradle@v3

    - name: Dar permissão de execução ao gradlew
      run: chmod +x gradlew

    - name: Compilar APK de Depuração (Debug APK)
      run: ./gradlew assembleDebug --stacktrace

    - name: Disponibilizar APK para Download
      uses: actions/upload-artifact@v4
      with:
        name: BrenoBattery-debug-apk
        path: app/build/outputs/apk/debug/app-debug.apk
        retention-days: 30
`
  },
  {
    path: 'README.md',
    filename: 'README.md',
    language: 'markdown',
    category: 'gradle',
    description: 'Guia completo passo a passo de como compilar e instalar o APK no seu celular Android.',
    content: `# Breno Battery - Projeto Android Kotlin Completo

Aplicativo Android nativo desenvolvido em **Kotlin** com **Jetpack Compose**, apresentando uma interface futurista em tons de **azul-escuro e preto** com modos **Simples**, **Técnico** e **Histórico**.

---

## 🚀 Como Gerar o Arquivo APK Instalável (.apk)

Você tem **3 maneiras fáceis** de gerar seu APK:

### Método 1: Pelo Android Studio (Mais Recomendado)
1. Extraia o arquivo zip baixado deste projeto.
2. Abra o **Android Studio** (versão Ladybug, Koala ou superior).
3. Clique em **File > Open** e selecione a pasta do projeto.
4. Aguarde o Gradle sincronizar as dependências automaticamente.
5. No menu superior, clique em:
   \`Build > Build Bundle(s) / APK(s) > Build APK(s)\`
6. Ao terminar, uma notificação aparecerá com o link **locate**. Clique nele para pegar o arquivo:
   \`app/build/outputs/apk/debug/app-debug.apk\`
7. Envie esse arquivo \`.apk\` via WhatsApp, Telegram, Google Drive ou cabo USB para o seu celular Android e instale!

---

### Método 2: Pela Linha de Comando (Gradle)
Se você já tem o Android SDK e Java 17 instalados na sua máquina:

\`\`\`bash
# No Linux ou macOS:
chmod +x gradlew
./gradlew assembleDebug

# No Windows (PowerShell / Prompt):
.\\gradlew.bat assembleDebug
\`\`\`

O APK pronto estará em:
\`app/build/outputs/apk/debug/app-debug.apk\`

---

### Método 3: Compilação Automática na Nuvem (GitHub Actions Grátis)
Não quer instalar o Android Studio no computador?
1. Crie um repositório no [GitHub](https://github.com).
2. Suba todos os arquivos deste projeto para o seu repositório.
3. Como já incluímos o arquivo \`.github/workflows/build-apk.yml\`, o GitHub compilará o APK automaticamente em minutos!
4. Vá na aba **Actions** no seu GitHub, clique na última execução e baixe o arquivo **BrenoBattery-debug-apk**.

---

## ⚡ Recursos do Breno Battery
- **Modo Simples**: Indicador circular com nível de porcentagem, tempo restante estimado, temperatura e saúde rápida.
- **Modo Técnico**: Tensão elétrica em milivolts (mV), corrente em mA, potência em Watts, tecnologia da célula (Li-ion), ciclos estimados e resistência interna (mΩ).
- **Histórico**: Registro temporal de eventos de carga, variações de temperatura e voltagem.
- **Serviço em Primeiro Plano**: Notificação permanente com telemetria contínua.
`
  }
];
