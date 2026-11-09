import SwiftUI

struct ContentView: View {
    @State private var board: [[String]] = [
        ["♜","♞","♝","♛","♚","♝","♞","♜"],
        Array(repeating: "♟", count: 8),
        Array(repeating: "", count: 8),
        Array(repeating: "", count: 8),
        Array(repeating: "", count: 8),
        Array(repeating: "", count: 8),
        Array(repeating: "♙", count: 8),
        ["♖","♘","♗","♕","♔","♗","♘","♖"]
    ]
    @State private var selected: (row: Int, col: Int)?
    @State private var moveText = "Tap a piece, then tap its destination."
    @State private var moveCount = 0
    private let files = ["a","b","c","d","e","f","g","h"]

    var body: some View {
        ZStack {
            Color(red: 0.055, green: 0.07, blue: 0.10).ignoresSafeArea()
            VStack(spacing: 18) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("CHESS AI").font(.system(size: 13, weight: .bold, design: .rounded)).tracking(3).foregroundStyle(.cyan)
                        Text("Study board").font(.system(size: 30, weight: .bold, design: .rounded)).foregroundStyle(.white)
                    }
                    Spacer()
                    Image(systemName: "brain.head.profile").font(.system(size: 27)).foregroundStyle(.cyan)
                }.padding(.horizontal)

                VStack(spacing: 0) {
                    ForEach(0..<8, id: \.self) { row in
                        HStack(spacing: 0) {
                            ForEach(0..<8, id: \.self) { col in
                                let isLight = (row + col).isMultiple(of: 2)
                                let isSelected = selected?.row == row && selected?.col == col
                                Button { handleTap(row: row, col: col) } label: {
                                    ZStack {
                                        Rectangle().fill(isSelected ? Color.cyan.opacity(0.75) : (isLight ? Color(red: 0.88, green: 0.85, blue: 0.76) : Color(red: 0.30, green: 0.43, blue: 0.42)))
                                        Text(board[row][col]).font(.system(size: 35)).foregroundStyle(pieceColor(board[row][col])).shadow(color: .black.opacity(0.18), radius: 1, y: 1)
                                        if board[row][col].isEmpty && selected != nil { Circle().fill(Color.black.opacity(0.18)).frame(width: 12, height: 12) }
                                    }.aspectRatio(1, contentMode: .fit)
                                }.buttonStyle(.plain)
                            }
                        }
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(.white.opacity(0.15), lineWidth: 1))
                .padding(.horizontal, 12)

                VStack(alignment: .leading, spacing: 10) {
                    Text("POSITION").font(.caption.bold()).tracking(2).foregroundStyle(.cyan)
                    Text(moveText).font(.subheadline).foregroundStyle(.white.opacity(0.8))
                    HStack {
                        Label("\(moveCount) moves", systemImage: "arrow.left.arrow.right")
                        Spacer()
                        Button("Reset board") { resetBoard() }.font(.subheadline.weight(.semibold)).foregroundStyle(.cyan)
                    }.foregroundStyle(.white.opacity(0.65)).font(.caption)
                }
                .padding(16)
                .background(Color.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 14))
                .padding(.horizontal)

                Text("Study prototype • Legal moves and engine analysis are not added yet.")
                    .font(.caption2).foregroundStyle(.white.opacity(0.4)).multilineTextAlignment(.center).padding(.horizontal)
                Spacer(minLength: 0)
            }.padding(.top, 18)
        }.preferredColorScheme(.dark)
    }

    private func pieceColor(_ piece: String) -> Color {
        ["♙","♖","♘","♗","♕","♔"].contains(piece) ? .white : .black
    }

    private func handleTap(row: Int, col: Int) {
        if let origin = selected {
            if origin.row == row && origin.col == col {
                selected = nil
                moveText = "Selection cleared."
                return
            }
            let piece = board[origin.row][origin.col]
            if !piece.isEmpty {
                board[row][col] = piece
                board[origin.row][origin.col] = ""
                moveCount += 1
                moveText = "\(piece) moved from \(files[origin.col])\(8-origin.row) to \(files[col])\(8-row)."
            }
            selected = nil
        } else if !board[row][col].isEmpty {
            selected = (row, col)
            moveText = "Selected \(board[row][col]) on \(files[col])\(8-row). Choose a destination."
        }
    }

    private func resetBoard() {
        board = [
            ["♜","♞","♝","♛","♚","♝","♞","♜"],
            Array(repeating: "♟", count: 8),
            Array(repeating: "", count: 8),
            Array(repeating: "", count: 8),
            Array(repeating: "", count: 8),
            Array(repeating: "", count: 8),
            Array(repeating: "♙", count: 8),
            ["♖","♘","♗","♕","♔","♗","♘","♖"]
        ]
        selected = nil
        moveCount = 0
        moveText = "Tap a piece, then tap its destination."
    }
}
