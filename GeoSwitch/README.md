# GeoSwitch

A full-width SwiftUI location-picker and local preview app for iPhone.

## Features
- Edge-to-edge map and responsive full-width layout
- Search for places and addresses
- Tap the map to move the pin
- Edit latitude and longitude
- Save and revisit selected locations
- Local preview toggle

## Important iOS limitation
A normal iOS app cannot change the device-wide GPS location reported to other installed apps. The preview toggle only changes the app's own UI state; it does not spoof GPS. Use Xcode's supported location simulation to test apps you develop.

## Build
Open this folder's `project.yml` with XcodeGen to generate the Xcode project, then build with Xcode for a connected iPhone. GitHub Actions can also build an unsigned IPA-shaped artifact. An unsigned artifact is not installable until signed with an appropriate Apple certificate and provisioning profile.
