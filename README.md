# Benchmark Timer

A powerful multi-tab timer application with Material Design, perfect for benchmarking, performance testing, and time tracking of complex workflows.

## Features

### 🎯 Core Functionality
- **Multi-tab System**: Create multiple project tabs, each with its own independent timer
- **Nested Timers**: Add sub-timers within each main timer to track individual steps
- **High Precision**: Timing accuracy up to 10 milliseconds (MM:SS.MS format)
- **Color-coded Tabs**: 12 different colors automatically assigned for easy project identification

### 🎨 Design
- **Material Design UI**: Clean, modern interface following Google's Material Design principles
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Smooth animations and instant visual feedback

### 💾 Data Management
- **Local Storage**: Tab data persists between sessions
- **Smart State Management**: Multiple timers can run simultaneously without interference

## Usage

### Getting Started
1. Open `index-material.html` in your web browser
2. Click the "+" button to create a new project tab
3. Click any tab to start its timer
4. Use "New Sub-timer" to track specific steps within your main task

### Timer Controls
- **Start/Pause**: Toggle button to control timer state
- **Reset**: Clear timer and all sub-timers
- **Close (×)**: Remove timer from active list

### Sub-timers
- Automatically named as "Step 1", "Step 2", etc.
- Shows the parent timer's time when started (@MM:SS.MS)
- Independent start/stop controls for each sub-timer

## Technical Details

### Architecture
- **Object-Oriented Design**: Three main classes - `SubTimer`, `Timer`, and `TimerApp`
- **Incremental DOM Updates**: Efficient rendering without losing timer states
- **Event-Driven**: Clean separation of concerns with event handlers

### Files Structure
```
benchmark-timer/
├── index-material.html      # Material Design version
├── styles-material.css      # Material Design styles
├── script-material.js       # Core application logic
├── index.html              # Original version
├── styles.css              # Original styles
└── script.js               # Original JavaScript
```

### Browser Compatibility
- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge (latest versions)

## Use Cases

- **Performance Testing**: Measure execution time of different code implementations
- **Workflow Analysis**: Track time spent on various project phases
- **Benchmarking**: Compare efficiency of different approaches
- **Task Management**: Monitor time allocation across multiple projects

## Development

### Dependencies
- Material Components Web (CDN)
- Google Fonts (Roboto, Material Icons)
- No build process required - runs directly in browser

### Local Development
Simply open the HTML file in your browser. No server required.

### Customization
- Colors can be modified in `styles-material.css` (look for color theme section)
- Timer precision can be adjusted by changing the interval in `setInterval` calls

## Future Enhancements
- Export timer data to CSV/JSON
- Cloud sync for cross-device usage
- Keyboard shortcuts for power users
- Timer history and analytics
- Dark mode support

## License
This project is open source and available under the MIT License.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using vanilla JavaScript and Material Design