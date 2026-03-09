package ai.SiriClaw-Instruct.app.node

import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructCalendarCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructCameraCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructCapability
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructContactsCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructDeviceCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructLocationCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructMotionCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructNotificationsCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructPhotosCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructSmsCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructSystemCommand
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      SiriClaw-InstructCapability.Canvas.rawValue,
      SiriClaw-InstructCapability.Device.rawValue,
      SiriClaw-InstructCapability.Notifications.rawValue,
      SiriClaw-InstructCapability.System.rawValue,
      SiriClaw-InstructCapability.Photos.rawValue,
      SiriClaw-InstructCapability.Contacts.rawValue,
      SiriClaw-InstructCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      SiriClaw-InstructCapability.Camera.rawValue,
      SiriClaw-InstructCapability.Location.rawValue,
      SiriClaw-InstructCapability.Sms.rawValue,
      SiriClaw-InstructCapability.VoiceWake.rawValue,
      SiriClaw-InstructCapability.Motion.rawValue,
    )

  private val coreCommands =
    setOf(
      SiriClaw-InstructDeviceCommand.Status.rawValue,
      SiriClaw-InstructDeviceCommand.Info.rawValue,
      SiriClaw-InstructDeviceCommand.Permissions.rawValue,
      SiriClaw-InstructDeviceCommand.Health.rawValue,
      SiriClaw-InstructNotificationsCommand.List.rawValue,
      SiriClaw-InstructNotificationsCommand.Actions.rawValue,
      SiriClaw-InstructSystemCommand.Notify.rawValue,
      SiriClaw-InstructPhotosCommand.Latest.rawValue,
      SiriClaw-InstructContactsCommand.Search.rawValue,
      SiriClaw-InstructContactsCommand.Add.rawValue,
      SiriClaw-InstructCalendarCommand.Events.rawValue,
      SiriClaw-InstructCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      SiriClaw-InstructCameraCommand.Snap.rawValue,
      SiriClaw-InstructCameraCommand.Clip.rawValue,
      SiriClaw-InstructCameraCommand.List.rawValue,
      SiriClaw-InstructLocationCommand.Get.rawValue,
      SiriClaw-InstructMotionCommand.Activity.rawValue,
      SiriClaw-InstructMotionCommand.Pedometer.rawValue,
      SiriClaw-InstructSmsCommand.Send.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          smsAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          smsAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          smsAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(SiriClaw-InstructMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(SiriClaw-InstructMotionCommand.Pedometer.rawValue))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    smsAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      smsAvailable = smsAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(actual: List<String>, expected: Set<String>) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(actual: List<String>, forbidden: Set<String>) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
