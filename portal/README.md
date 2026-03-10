# Portal - 3D World Viewer

Portal is a Croquet Greenlight app that integrates with Microverse and Worldcore to load, portal, and render 3D worlds.

## Overview

Portal allows you to:

- Load Microverse worlds within the Greenlight canvas
- Render interactive 3D environments using Worldcore
- Explore multiplayer 3D spaces in real-time
- Seamlessly integrate 3D worlds with other Greenlight apps

## Integration Points

### Microverse

Microverse is a high-level framework built on top of Croquet that simplifies building shared 3D worlds. Portal can load any Microverse world by providing the world URL.

**Resources:**

- [Microverse GitHub](https://github.com/croquet/microverse)
- [Microverse Documentation (Archived)](https://web.archive.org/web/20230930185938/https://croquet.io/docs/microverse/index.html)

### Worldcore

Worldcore is the entity-management system that Microverse is built on. It provides:

- Actor/Pawn system for model-view synchronization
- Spatial mixins (AM_Spatial, PM_Spatial) for 3D positioning
- Services for rendering, input, and physics
- Mixin system for extensibility

**Resources:**

- [Worldcore GitHub](https://github.com/croquet/worldcore)
- [Worldcore Documentation (Archived)](https://web.archive.org/web/20240909212020/https://croquet.io/docs/worldcore/)

## Usage

### Try the Demo World

Portal includes a demo world to test functionality:

1. Open Greenlight and click the **Portal** app icon
2. You'll see a loading message
3. Try loading the demo world with: `http://localhost:8000/portal/demo-world.html`

The demo world displays a 3D rotating cube to demonstrate world rendering capabilities.

### Basic World Loading

1. Upload a Microverse world URL to Portal
2. Portal will iframe the world and display it
3. Controls appear at the bottom-left:
   - Mouse: Look around
   - WASD: Move
   - Interact with world objects as defined by the world

### Loading Custom Worlds

Create a custom world by:

```javascript
// In your Microverse world's main script
import { StartWorldcore } from "@croquet/worldcore";
import { WorldcoreModel, WorldcoreView } from "@croquet/microverse-library";

class MyWorldModel extends WorldcoreModel {
  init() {
    super.init();
    // Create actors and world objects
  }
}

class MyWorldView extends WorldcoreView {
  init() {
    super.init();
    // Set up rendering and input
  }
}

StartWorldcore({
  appId: "com.mycompany.myworld",
  apiKey: "your-api-key",
  name: "myworld",
  password: "password",
  model: MyWorldModel,
  view: MyWorldView,
});
```

## Architecture

### Portal Flow

1. **User selects Portal app** in Greenlight toolbar
2. **User enters/provides world URL** (Microverse world or custom Worldcore app)
3. **Portal creates iframe** with the world URL
4. **Microverse/Worldcore initializes** within the iframe
5. **World renders** with full 3D capabilities
6. **Users interact** with the 3D environment in real-time

### Key Components

- **portal/croquet-app.html** - Main Portal app interface
- **assets/icons/portal.svgIcon** - Portal app icon (spiral/swirl design)
- **Microverse worlds** - Can be local or hosted
- **Worldcore layer** - Provides multiplayer synchronization

## Setting Up Development

### Prerequisites

- Node.js 14+
- npm

### Create a Microverse World

```bash
npm create croquet-microverse my-world
cd my-world
npm start
```

This creates a development world. Deploy to a web server for use with Portal.

### Test Portal with Your World

1. Start your Microverse world development server
2. Open Greenlight and click Portal
3. Enter: `http://localhost:9684` (or your world's URL)
4. Press Enter or Upload to load the world

## API Reference

### Portal App Configuration

When Portal is opened, it expects one of:

1. **Direct iframe loading** - URL to a hosted Microverse world
2. **Croquet handle** - Reference to a stored world configuration
3. **World URL** - HTTP/HTTPS URL to a Microverse project

### Microverse World URL Format

```
https://example.com/myworld/
```

The URL should point to the root of a Microverse project directory.

## Future Enhancements

- [ ] World library/browser
- [ ] World editor integration
- [ ] Physics simulation visualization
- [ ] Avatar presence (show other users in world)
- [ ] Asset manager for world resources
- [ ] Export/share world configurations
- [ ] VR/XR support

## Resources

### Documentation

- [Microverse Quick Start](https://web.archive.org/web/20230930185938/https://croquet.io/docs/microverse/index.html)
- [Worldcore Overview](https://web.archive.org/web/20240909212020/https://croquet.io/docs/worldcore/)
- [Croquet API Docs](https://croquet.io/docs/)

### Community

- [Croquet Discord](https://croquet.io/discord/)
- [GitHub Discussions](https://github.com/croquet/microverse/discussions)

## License

Same as Greenlight-core project. See LICENSE file.
