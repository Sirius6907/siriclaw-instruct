package ai.SiriClaw-Instruct.app.node

import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructCalendarCommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructCanvasA2UICommand
import ai.SiriClaw-Instruct.app.protocol.SiriClaw-InstructCanvasCommand
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

data class NodeRuntimeFlags(
  val cameraEnabled: Boolean,
  val locationEnabled: Boolean,
  val smsAvailable: Boolean,
  val voiceWakeEnabled: Boolean,
  val motionActivityAvailable: Boolean,
  val motionPedometerAvailable: Boolean,
  val debugBuild: Boolean,
)

enum class InvokeCommandAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  MotionActivityAvailable,
  MotionPedometerAvailable,
  DebugBuild,
}

enum class NodeCapabilityAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  VoiceWakeEnabled,
  MotionAvailable,
}

data class NodeCapabilitySpec(
  val name: String,
  val availability: NodeCapabilityAvailability = NodeCapabilityAvailability.Always,
)

data class InvokeCommandSpec(
  val name: String,
  val requiresForeground: Boolean = false,
  val availability: InvokeCommandAvailability = InvokeCommandAvailability.Always,
)

object InvokeCommandRegistry {
  val capabilityManifest: List<NodeCapabilitySpec> =
    listOf(
      NodeCapabilitySpec(name = SiriClaw-InstructCapability.Canvas.rawValue),
      NodeCapabilitySpec(name = SiriClaw-InstructCapability.Device.rawValue),
      NodeCapabilitySpec(name = SiriClaw-InstructCapability.Notifications.rawValue),
      NodeCapabilitySpec(name = SiriClaw-InstructCapability.System.rawValue),
      NodeCapabilitySpec(
        name = SiriClaw-InstructCapability.Camera.rawValue,
        availability = NodeCapabilityAvailability.CameraEnabled,
      ),
      NodeCapabilitySpec(
        name = SiriClaw-InstructCapability.Sms.rawValue,
        availability = NodeCapabilityAvailability.SmsAvailable,
      ),
      NodeCapabilitySpec(
        name = SiriClaw-InstructCapability.VoiceWake.rawValue,
        availability = NodeCapabilityAvailability.VoiceWakeEnabled,
      ),
      NodeCapabilitySpec(
        name = SiriClaw-InstructCapability.Location.rawValue,
        availability = NodeCapabilityAvailability.LocationEnabled,
      ),
      NodeCapabilitySpec(name = SiriClaw-InstructCapability.Photos.rawValue),
      NodeCapabilitySpec(name = SiriClaw-InstructCapability.Contacts.rawValue),
      NodeCapabilitySpec(name = SiriClaw-InstructCapability.Calendar.rawValue),
      NodeCapabilitySpec(
        name = SiriClaw-InstructCapability.Motion.rawValue,
        availability = NodeCapabilityAvailability.MotionAvailable,
      ),
    )

  val all: List<InvokeCommandSpec> =
    listOf(
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasCommand.Present.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasCommand.Hide.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasCommand.Navigate.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasCommand.Eval.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasCommand.Snapshot.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasA2UICommand.Push.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasA2UICommand.PushJSONL.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCanvasA2UICommand.Reset.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructSystemCommand.Notify.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCameraCommand.List.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCameraCommand.Snap.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCameraCommand.Clip.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructLocationCommand.Get.rawValue,
        availability = InvokeCommandAvailability.LocationEnabled,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructDeviceCommand.Status.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructDeviceCommand.Info.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructDeviceCommand.Permissions.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructDeviceCommand.Health.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructNotificationsCommand.List.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructNotificationsCommand.Actions.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructPhotosCommand.Latest.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructContactsCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructContactsCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCalendarCommand.Events.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructCalendarCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructMotionCommand.Activity.rawValue,
        availability = InvokeCommandAvailability.MotionActivityAvailable,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructMotionCommand.Pedometer.rawValue,
        availability = InvokeCommandAvailability.MotionPedometerAvailable,
      ),
      InvokeCommandSpec(
        name = SiriClaw-InstructSmsCommand.Send.rawValue,
        availability = InvokeCommandAvailability.SmsAvailable,
      ),
      InvokeCommandSpec(
        name = "debug.logs",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
      InvokeCommandSpec(
        name = "debug.ed25519",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
    )

  private val byNameInternal: Map<String, InvokeCommandSpec> = all.associateBy { it.name }

  fun find(command: String): InvokeCommandSpec? = byNameInternal[command]

  fun advertisedCapabilities(flags: NodeRuntimeFlags): List<String> {
    return capabilityManifest
      .filter { spec ->
        when (spec.availability) {
          NodeCapabilityAvailability.Always -> true
          NodeCapabilityAvailability.CameraEnabled -> flags.cameraEnabled
          NodeCapabilityAvailability.LocationEnabled -> flags.locationEnabled
          NodeCapabilityAvailability.SmsAvailable -> flags.smsAvailable
          NodeCapabilityAvailability.VoiceWakeEnabled -> flags.voiceWakeEnabled
          NodeCapabilityAvailability.MotionAvailable -> flags.motionActivityAvailable || flags.motionPedometerAvailable
        }
      }
      .map { it.name }
  }

  fun advertisedCommands(flags: NodeRuntimeFlags): List<String> {
    return all
      .filter { spec ->
        when (spec.availability) {
          InvokeCommandAvailability.Always -> true
          InvokeCommandAvailability.CameraEnabled -> flags.cameraEnabled
          InvokeCommandAvailability.LocationEnabled -> flags.locationEnabled
          InvokeCommandAvailability.SmsAvailable -> flags.smsAvailable
          InvokeCommandAvailability.MotionActivityAvailable -> flags.motionActivityAvailable
          InvokeCommandAvailability.MotionPedometerAvailable -> flags.motionPedometerAvailable
          InvokeCommandAvailability.DebugBuild -> flags.debugBuild
        }
      }
      .map { it.name }
  }
}
