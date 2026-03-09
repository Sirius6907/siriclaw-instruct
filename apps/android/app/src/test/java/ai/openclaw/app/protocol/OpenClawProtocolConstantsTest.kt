package ai.SiriClaw-Instruct.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class SiriClaw-InstructProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", SiriClaw-InstructCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", SiriClaw-InstructCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", SiriClaw-InstructCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", SiriClaw-InstructCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", SiriClaw-InstructCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", SiriClaw-InstructCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", SiriClaw-InstructCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", SiriClaw-InstructCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", SiriClaw-InstructCapability.Canvas.rawValue)
    assertEquals("camera", SiriClaw-InstructCapability.Camera.rawValue)
    assertEquals("voiceWake", SiriClaw-InstructCapability.VoiceWake.rawValue)
    assertEquals("location", SiriClaw-InstructCapability.Location.rawValue)
    assertEquals("sms", SiriClaw-InstructCapability.Sms.rawValue)
    assertEquals("device", SiriClaw-InstructCapability.Device.rawValue)
    assertEquals("notifications", SiriClaw-InstructCapability.Notifications.rawValue)
    assertEquals("system", SiriClaw-InstructCapability.System.rawValue)
    assertEquals("photos", SiriClaw-InstructCapability.Photos.rawValue)
    assertEquals("contacts", SiriClaw-InstructCapability.Contacts.rawValue)
    assertEquals("calendar", SiriClaw-InstructCapability.Calendar.rawValue)
    assertEquals("motion", SiriClaw-InstructCapability.Motion.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", SiriClaw-InstructCameraCommand.List.rawValue)
    assertEquals("camera.snap", SiriClaw-InstructCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", SiriClaw-InstructCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", SiriClaw-InstructNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", SiriClaw-InstructNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", SiriClaw-InstructDeviceCommand.Status.rawValue)
    assertEquals("device.info", SiriClaw-InstructDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", SiriClaw-InstructDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", SiriClaw-InstructDeviceCommand.Health.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", SiriClaw-InstructSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", SiriClaw-InstructPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", SiriClaw-InstructContactsCommand.Search.rawValue)
    assertEquals("contacts.add", SiriClaw-InstructContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", SiriClaw-InstructCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", SiriClaw-InstructCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", SiriClaw-InstructMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", SiriClaw-InstructMotionCommand.Pedometer.rawValue)
  }
}
