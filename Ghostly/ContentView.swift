import SwiftUI
import MapKit

struct ContentView: View {
    @State private var latitude = 59.4370
    @State private var longitude = 24.7536
    @State private var isSimulating = false
    @State private var savedLocations: [SavedLocation] = []
    @State private var cameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: 59.4370, longitude: 24.7536),
                           span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08))
    )

    private var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }

    var body: some View {
        ZStack {
            Color(red: 0.035, green: 0.045, blue: 0.065).ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("GHOSTLY").font(.system(size: 27, weight: .black, design: .rounded))
                            Text("LOCATION LAB").font(.caption.weight(.semibold)).tracking(2).foregroundStyle(.cyan)
                        }
                        Spacer()
                        Image(systemName: "location.circle.fill").font(.system(size: 34)).foregroundStyle(.cyan)
                    }.padding(.top, 8)

                    MapReader { proxy in
                        Map(position: $cameraPosition) {
                            Annotation("Selected test point", coordinate: coordinate) {
                                ZStack {
                                    Circle().fill(Color.cyan.opacity(0.2)).frame(width: 42, height: 42)
                                    Circle().fill(Color.cyan).frame(width: 14, height: 14)
                                        .overlay(Circle().stroke(.white, lineWidth: 2))
                                }
                            }
                        }
                        .mapStyle(.standard(elevation: .realistic))
                        .frame(height: 300)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                        .overlay(alignment: .bottom) {
                            Text("Tap the map to choose a test point")
                                .font(.caption.weight(.medium)).padding(.horizontal, 12).padding(.vertical, 8)
                                .background(.ultraThinMaterial, in: Capsule()).padding(12)
                        }
                        .onTapGesture { point in
                            if let c = proxy.convert(point, from: .local) {
                                latitude = c.latitude; longitude = c.longitude; isSimulating = false
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("TEST COORDINATES").font(.caption.weight(.bold)).foregroundStyle(.secondary)
                        HStack(spacing: 12) {
                            coordinateField(title: "LATITUDE", value: $latitude, range: -90...90)
                            coordinateField(title: "LONGITUDE", value: $longitude, range: -180...180)
                        }
                        if isSimulating {
                            Label("Simulation active in Ghostly", systemImage: "checkmark.circle.fill")
                                .font(.caption.weight(.semibold)).foregroundStyle(.green)
                        }
                    }.padding(16).background(Color.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 18))

                    Button { isSimulating.toggle() } label: {
                        Label(isSimulating ? "Stop local simulation" : "Start local simulation",
                              systemImage: isSimulating ? "stop.fill" : "play.fill")
                            .font(.headline).frame(maxWidth: .infinity).padding(.vertical, 17)
                            .background(isSimulating ? Color.orange : Color.cyan, in: RoundedRectangle(cornerRadius: 16))
                            .foregroundStyle(.black)
                    }

                    HStack(spacing: 10) {
                        Button("Save location") {
                            savedLocations.append(SavedLocation(name: "Test point \(savedLocations.count + 1)",
                                                                latitude: latitude, longitude: longitude))
                        }.buttonStyle(SecondaryButtonStyle())
                        Button("Reset to Tallinn") {
                            latitude = 59.4370; longitude = 24.7536; isSimulating = false
                            cameraPosition = .region(MKCoordinateRegion(center: coordinate,
                                span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)))
                        }.buttonStyle(SecondaryButtonStyle())
                    }

                    if !savedLocations.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("SAVED TEST LOCATIONS").font(.caption.weight(.bold)).foregroundStyle(.secondary)
                            ForEach(savedLocations) { item in
                                Button {
                                    latitude = item.latitude; longitude = item.longitude; isSimulating = false
                                    cameraPosition = .region(MKCoordinateRegion(center: coordinate,
                                        span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)))
                                } label: {
                                    HStack {
                                        Text(item.name).foregroundStyle(.white); Spacer()
                                        Text(item.coordinateText).font(.caption.monospaced()).foregroundStyle(.secondary)
                                    }.padding(14).background(Color.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 12))
                                }
                            }
                        }
                    }
                    Text("LOCAL TEST MODE").font(.caption2.weight(.bold)).foregroundStyle(.cyan)
                    Text("Coordinates are simulated inside Ghostly only. This app does not change iOS system location or the location received by other apps.")
                        .font(.footnote).foregroundStyle(.secondary)
                }.padding(18)
            }
        }
        .onChange(of: latitude) { _, _ in isSimulating = false }
        .onChange(of: longitude) { _, _ in isSimulating = false }
    }

    private func coordinateField(title: String, value: Binding<Double>, range: ClosedRange<Double>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.caption2.weight(.bold)).foregroundStyle(.secondary)
            TextField("0.0000", value: value, format: .number.precision(.fractionLength(4...6)))
                .keyboardType(.numbersAndPunctuation)
                .font(.system(.body, design: .monospaced))
                .padding(11).background(Color.black.opacity(0.25), in: RoundedRectangle(cornerRadius: 10))
                .onChange(of: value.wrappedValue) { _, v in
                    value.wrappedValue = v.isFinite ? min(max(v, range.lowerBound), range.upperBound) : 0
                }
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct SavedLocation: Identifiable {
    let id = UUID()
    let name: String
    let latitude: Double
    let longitude: Double
    var coordinateText: String { String(format: "%.4f, %.4f", latitude, longitude) }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.white.opacity(configuration.isPressed ? 0.12 : 0.07), in: RoundedRectangle(cornerRadius: 14))
            .foregroundStyle(.white)
    }
}
