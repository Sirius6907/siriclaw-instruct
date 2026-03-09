package ai.SiriClaw-Instruct.app.ui

import androidx.compose.runtime.Composable
import ai.SiriClaw-Instruct.app.MainViewModel
import ai.SiriClaw-Instruct.app.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
