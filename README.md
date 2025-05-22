# Space Gravity Simulator

An interactive 3D simulation of gravitational forces in space built with React and Three.js.

## Features

- Realistic physics-based gravity simulation using Newton's law of universal gravitation
- Interactive 3D environment with realistic celestial bodies
- Visual orbit paths showing the trajectory of celestial bodies
- Real-time metrics and equations display
- Controls to adjust simulation speed, pause/play, and add random celestial bodies
- Select and focus on different celestial bodies to see their details

## Technologies Used

- React.js - Frontend framework
- Three.js - 3D rendering library
- React Three Fiber - React bindings for Three.js
- React Three Drei - Helpful components for React Three Fiber

## Physics Implementation

The simulation implements the following gravitational physics concepts:

- **Newton's Law of Universal Gravitation**: F = G × (m₁m₂) / r²
- **Acceleration Due to Gravity**: a = G × M / r²
- **Orbital Velocity**: v = √(G × M / r)
- **Kepler's Third Law**: T² ∝ r³

## Getting Started

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Start the development server:
```
npm start
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Controls

- **Rotate**: Left-click drag
- **Pan**: Right-click drag
- **Zoom**: Scroll wheel
- **Select Body**: Use the dropdown in the control panel
- **Time Speed**: Adjust the slider to speed up or slow down the simulation
- **Pause/Play**: Toggle simulation running state
- **Add Random Body**: Add a new randomly generated celestial body to the simulation

## Project Structure

- `src/components/` - React components
- `src/utils/` - Utility functions for physics calculations
- `src/styles/` - CSS styles for components

## Future Improvements

- Add more celestial bodies from our solar system
- Implement custom celestial body creation with user-defined parameters
- Add visualization of gravitational fields
- Improve performance for simulating more bodies simultaneously

## License

This project is licensed under the MIT License.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
