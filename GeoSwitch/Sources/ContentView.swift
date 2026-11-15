import SwiftUI
import MapKit
import CoreLocation

struct SavedPlace: Identifiable, Codable, Equatable {
    var id = UUID()
    var name: String
    var latitude: Double
    var longitude: Double
}

@MainActor
final class GeoSwitchModel: ObservableObject {
    @Published var coordinate = CLLocationCoordinate2D(latitude: 59.4370, longitude: 24.7536)
    @Published var camera: MapCameraPosition = .region(
        MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: 59.4370, longitude: 24.7536),
                           span: MKCoordinateSpan(latitudeDelta: 0.035, longitudeDelta: 0.035))
    )
    @Published var latitudeText = "59.4370"
    @Published var longitudeText = "24.7536"
    @Published var placeName = "Tallinn, Estonia"
    @Published var isPreviewing = false
    @Published var saved: [SavedPlace] = [
        SavedPlace(name: "Tallinn", latitude: 59.4370, longitude: 24.7536)
    ]

    func setCoordinate(_ value: CLLocationCoordinate2D, name: String? = nil) {
        coordinate = value
        latitudeText = String(format: "%.6f", value.latitude)
        longitudeText = String(format: "%.6f", value.longitude)
        if let name { placeName = name }
        camera = .region(MKCoordinateRegion(center: value,
            span: MKCoordinateSpan(latitudeDelta: 0.035, longitudeDelta: 0.035)))
    }

    func applyCoordinates() {
        guard let lat = Double(latitudeText), let lon = Double(longitudeText),
              (-90...90).contains(lat), (-180...180).contains(lon) else { return }
        setCoordinate(CLLocationCoordinate2D(latitude: lat, longitude: lon), name: "Custom coordinates")
    }

    func addSavedPlace() {
        let item = SavedPlace(name: placeName, latitude: coordinate.latitude, longitude: coordinate.longitude)
        if !saved.contains(where: { abs($0.latitude - item.latitude) < 0.00001 && abs($0.longitude - item.longitude) < 0.00001 }) {
            saved.insert(item, at: 0)
        }
    }

    func choose(_ item: SavedPlace) {
        setCoordinate(CLLocationCoordinate2D(latitude: item.latitude, longitude: item.longitude), name: item.name)
    }
}

struct ContentView: View {
    @StateObject private var model = GeoSwitchModel()
    @State private var searchText = ""
    @State private var searchResults: [MKMapItem] = []
    @State private var showingSaved = false

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color(red: 0.035, green: 0.045, blue: 0.075).ignoresSafeArea()
                VStack(spacing: 0) {
                    header
                    searchBar
                    mapPanel
                        .frame(height: min(max(geometry.size.height * 0.47, 300), 430))
                        .frame(maxWidth: .infinity)
                    controlPanel
                    footer
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .ignoresSafeArea(edges: .horizontal)
        }
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showingSaved) {
            savedSheet
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            Image(systemName: "location.fill")
                .font(.system(size: 24, weight: .bold))
                .foregroundStyle(.cyan)
                .frame(width: 52, height: 52)
                .background(.cyan.opacity(0.14), in: RoundedRectangle(cornerRadius: 16))
            VStack(alignment: .leading, spacing: 3) {
                Text("GeoSwitch").font(.system(size: 27, weight: .bold, design: .rounded))
                Text("LOCATION TEST LAB").font(.system(size: 11, weight: .bold, design: .rounded)).tracking(1.8).foregroundStyle(.secondary)
            }
            Spacer(minLength: 8)
            Button { showingSaved = true } label: {
                Image(systemName: "bookmark")
                    .font(.system(size: 20, weight: .semibold))
                    .frame(width: 50, height: 50)
                    .background(.white.opacity(0.09), in: RoundedRectangle(cornerRadius: 16))
            }
            .tint(.white)
            .accessibilityLabel("Saved locations")
        }
        .padding(.horizontal, 16)
        .padding(.top, 10)
        .padding(.bottom, 14)
    }

    private var searchBar: some View {
        VStack(spacing: 7) {
            HStack(spacing: 11) {
                Image(systemName: "magnifyingglass").font(.system(size: 18, weight: .semibold)).foregroundStyle(.secondary)
                TextField("Search a city or address", text: $searchText)
                    .font(.system(size: 16))
                    .submitLabel(.search)
                    .onSubmit { searchPlaces() }
                    .tint(.cyan)
                Button("Search") { searchPlaces() }
                    .font(.system(size: 15, weight: .bold))
                    .tint(.cyan)
            }
            .padding(.horizontal, 16)
            .frame(height: 56)
            .background(.white.opacity(0.09), in: RoundedRectangle(cornerRadius: 17))
            if !searchResults.isEmpty {
                VStack(spacing: 0) {
                    ForEach(searchResults.indices.prefix(4), id: \.self) { index in
                        let item = searchResults[index]
                        Button {
                            if let point = item.placemark.location?.coordinate {
                                model.setCoordinate(point, name: item.name ?? "Selected place")
                            }
                            searchResults = []
                        } label: {
                            HStack {
                                Image(systemName: "mappin").foregroundStyle(.cyan)
                                Text(item.name ?? "Place").foregroundStyle(.white)
                                Spacer()
                                Image(systemName: "arrow.up.left").foregroundStyle(.secondary)
                            }.padding(13)
                        }
                    }
                }
                .background(.white.opacity(0.09), in: RoundedRectangle(cornerRadius: 14))
            }
        }
        .padding(.horizontal, 14)
        .padding(.bottom, 13)
    }

    private var mapPanel: some View {
        MapReader { proxy in
            Map(position: $model.camera) {
                Annotation(model.placeName, coordinate: model.coordinate, anchor: .bottom) {
                    Image(systemName: "mappin.and.ellipse")
                        .font(.system(size: 38, weight: .bold))
                        .foregroundStyle(.cyan)
                        .shadow(color: .black.opacity(0.5), radius: 5)
                }
            }
            .mapStyle(.standard(elevation: .realistic))
            .mapControls { MapCompass(); MapScaleView() }
            .onTapGesture { position in
                if let point = proxy.convert(position, from: .local) {
                    model.setCoordinate(point, name: "Dropped pin")
                }
            }
            .overlay(alignment: .topLeading) {
                Label("TAP MAP TO MOVE PIN", systemImage: "hand.tap")
                    .font(.system(size: 11, weight: .bold))
                    .tracking(0.8)
                    .padding(.horizontal, 13).padding(.vertical, 9)
                    .background(.black.opacity(0.72), in: Capsule())
                    .padding(13)
            }
            .clipShape(RoundedRectangle(cornerRadius: 0))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .overlay(alignment: .bottom) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(model.placeName).font(.system(size: 16, weight: .bold)).lineLimit(1)
                    Text(String(format: "%.5f, %.5f", model.coordinate.latitude, model.coordinate.longitude))
                        .font(.system(size: 12, design: .monospaced)).foregroundStyle(.white.opacity(0.75))
                }
                Spacer(minLength: 8)
                Button { model.addSavedPlace() } label: {
                    Image(systemName: "bookmark.fill").font(.system(size: 17, weight: .bold)).foregroundStyle(.cyan)
                        .frame(width: 46, height: 46).background(.black.opacity(0.72), in: Circle())
                }
                .accessibilityLabel("Save this location")
            }
            .padding(14)
            .background(.black.opacity(0.78))
        }
    }

    private var controlPanel: some View {
        VStack(alignment: .leading, spacing: 13) {
            HStack {
                Text("COORDINATES").font(.system(size: 12, weight: .bold)).tracking(1.2).foregroundStyle(.secondary)
                Spacer()
                Text("WGS84").font(.system(size: 11, weight: .bold, design: .monospaced)).foregroundStyle(.cyan)
            }
            HStack(spacing: 10) {
                coordinateField(title: "LATITUDE", text: $model.latitudeText)
                coordinateField(title: "LONGITUDE", text: $model.longitudeText)
                Button { model.applyCoordinates() } label: {
                    Image(systemName: "checkmark")
                        .font(.system(size: 19, weight: .bold))
                        .frame(width: 54, height: 58)
                        .background(.cyan, in: RoundedRectangle(cornerRadius: 15))
                        .foregroundStyle(.black)
                }
                .accessibilityLabel("Apply coordinates")
            }
            Button {
                model.isPreviewing.toggle()
            } label: {
                HStack(spacing: 11) {
                    Image(systemName: model.isPreviewing ? "stop.fill" : "play.fill")
                    Text(model.isPreviewing ? "STOP LOCAL PREVIEW" : "START LOCAL PREVIEW")
                    Spacer()
                    Text(model.isPreviewing ? "ACTIVE" : "READY")
                        .font(.system(size: 11, weight: .heavy, design: .monospaced))
                        .padding(.horizontal, 10).padding(.vertical, 6)
                        .background(.black.opacity(0.15), in: Capsule())
                }
                .font(.system(size: 14, weight: .heavy))
                .padding(.horizontal, 18).frame(maxWidth: .infinity).frame(height: 58)
                .background(model.isPreviewing ? Color.orange : Color.cyan, in: RoundedRectangle(cornerRadius: 17))
                .foregroundStyle(.black)
            }
            Text("Preview only — this does not change the GPS location reported to Snapchat or other apps.")
                .font(.system(size: 12)).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 16)
        .padding(.top, 17)
        .padding(.bottom, 10)
    }

    private func coordinateField(title: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.system(size: 10, weight: .bold)).tracking(0.8).foregroundStyle(.secondary)
            TextField("0.000000", text: text)
                .keyboardType(.numbersAndPunctuation)
                .font(.system(size: 15, weight: .semibold, design: .monospaced))
                .tint(.cyan)
        }
        .padding(.horizontal, 13)
        .frame(maxWidth: .infinity, alignment: .leading)
        .frame(height: 58)
        .background(.white.opacity(0.09), in: RoundedRectangle(cornerRadius: 15))
    }

    private var footer: some View {
        HStack {
            Label("LOCATION PREVIEW", systemImage: "iphone")
            Spacer()
            Text("v1.1.0")
        }
        .font(.system(size: 10, weight: .bold, design: .monospaced))
        .foregroundStyle(.secondary)
        .padding(.horizontal, 18)
        .padding(.vertical, 9)
    }

    private var savedSheet: some View {
        NavigationStack {
            List {
                ForEach(model.saved) { place in
                    Button {
                        model.choose(place)
                        showingSaved = false
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(place.name).font(.headline)
                            Text(String(format: "%.6f, %.6f", place.latitude, place.longitude))
                                .font(.caption.monospaced()).foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete { model.saved.remove(atOffsets: $0) }
            }
            .navigationTitle("Saved locations")
            .toolbar { EditButton() }
        }
        .preferredColorScheme(.dark)
    }

    private func searchPlaces() {
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = searchText
        MKLocalSearch(request: request).start { response, _ in
            DispatchQueue.main.async { searchResults = response?.mapItems ?? [] }
        }
    }
}
