import ReplayKit
import CoreImage
import UIKit

final class SampleHandler: RPBroadcastSampleHandler {
    private let context = CIContext()
    private let appGroup = "group.com.arxike.chessai"
    private var lastSavedAt = Date.distantPast

    override func broadcastStarted(withSetupInfo setupInfo: [String : NSObject]?) {
        lastSavedAt = .distantPast
    }

    override func broadcastPaused() {}

    override func broadcastResumed() {}

    override func broadcastFinished() {}

    override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
        guard sampleBufferType == .video else { return }
        // Keep only an occasional still frame for later study; do not stream or upload screen contents.
        guard Date().timeIntervalSince(lastSavedAt) >= 3 else { return }
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer),
              let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
            return
        }

        let image = CIImage(cvPixelBuffer: pixelBuffer)
        guard let cgImage = context.createCGImage(image, from: image.extent) else { return }
        let uiImage = UIImage(cgImage: cgImage)
        guard let data = uiImage.jpegData(compressionQuality: 0.75) else { return }

        do {
            try FileManager.default.createDirectory(at: container, withIntermediateDirectories: true)
            try data.write(to: container.appendingPathComponent("latest-screen.jpg"), options: .atomic)
            lastSavedAt = Date()
        } catch {
            // A failed save is non-fatal; the broadcast can continue.
        }
    }
}
