# Chess 3D

An interactive 3D chess game built with modern web technologies. Featuring full chess game logic, stunning 3D visualization, and an intuitive interface for playing chess in a three-dimensional environment.

## Features

- **3D Chess Board & Pieces**: Rendered with Three.js for a realistic, immersive experience
- **Interactive Camera Control**: Rotate, zoom, and pan around the board using OrbitControls
- **Full Chess Logic**: 
  - Valid move calculation for all piece types (pawns, rooks, knights, bishops, queens, kings)
  - Proper handling of special moves and piece movement rules
  - Real-time board state management
- **Responsive Design**: Built with Tailwind CSS for optimal viewing on all devices
- **Smooth Animations**: Fluid piece movements and camera interactions

## Tech Stack

- **Framework**: [Next.js 16.2.4](https://nextjs.org) - React-based full-stack framework
- **UI Library**: [React 19.2.4](https://react.dev) - Component-based UI
- **3D Graphics**: [Three.js 0.184.0](https://threejs.org) - WebGL 3D graphics library
- **React 3D Integration**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) - React renderer for Three.js
- **3D Utilities**: [@react-three/drei](https://drei.pmnd.rs/) - Useful 3D components and tools
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- **Language**: [TypeScript 5](https://www.typescriptlang.org) - Type-safe JavaScript
- **Linting**: [ESLint 9](https://eslint.org) - Code quality tool

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chess3d
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
chess3d/
├── src/
│   └── app/
│       ├── page.tsx                 # Main page component
│       ├── layout.tsx               # Root layout
│       ├── chess_pieces_3d_models.jsx # 3D chess implementation
│       └── globals.css              # Global styles
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.mjs              # Tailwind CSS configuration
└── eslint.config.mjs                # ESLint configuration
```

## How It Works

The 3D chess game is built around the `ChessPieces` component, which:

1. **Initializes the Chess Board**: Sets up the standard chess starting position
2. **Renders 3D Models**: Uses Three.js to display chess pieces and the board in 3D space
3. **Handles Interactions**: Manages piece selection and movement with mouse/keyboard input
4. **Validates Moves**: Ensures all piece movements follow standard chess rules
5. **Updates State**: Manages the game state and piece positions

## Development

### Code Quality

The project uses ESLint to maintain code quality. Run the linter with:
```bash
npm run lint
```

### Building for Production

Create an optimized production build:
```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests to help improve the project.
