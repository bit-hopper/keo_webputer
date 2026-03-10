# I/O - Interface

I/O is a Croquet Greenlight app that provides a Web Serial interface for connecting to and communicating with microcontrollers, Arduino boards, and other serial devices.

## Overview

I/O enables you to:

- Connect to microcontroller boards via USB serial ports
- Send and receive data in real-time
- Interface with hardware projects using Web Serial API
- Integrate with MicroBlocks, Adafruit IO, and other platforms
- Debug and monitor serial communication

## Supported Hardware

I/O works with any device that exposes a serial port:

- **Arduino** - All Arduino boards with USB/Serial support
- **ESP32/ESP8266** - WiFi-enabled microcontrollers
- **BBC micro:bit** - Educational microcontroller
- **Adafruit boards** - Metro, Feather, and other Adafruit products
- **MicroBlocks** - Open-source block-based programming for microcontrollers
- **Custom devices** - Any device with serial communication

## Getting Started

### Prerequisites

- A USB-connected microcontroller or Arduino board
- A modern web browser with Web Serial API support:
  - Chrome 89+
  - Edge 89+
  - Opera 75+
  - Other Chromium-based browsers

### Basic Usage

1. **Connect a Device**

   - Plug your microcontroller into your computer via USB
   - Click "Connect Port" in the I/O app
   - Select your device from the popup dialog
   - Wait for the "Connected" status

2. **Send Commands**

   - Type a command in the input field (e.g., `LED ON`)
   - Press Enter or click "Send"
   - Commands are sent with a newline character (`\n`)

3. **Monitor Output**
   - Data received from the device appears in the console
   - Color-coded lines indicate:
     - **Blue**: Information messages
     - **Green**: Success messages
     - **Red**: Error messages
     - **Purple**: Data from device

### Arduino Example

```cpp
// Simple Arduino sketch to test I/O communication
void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');

    if (command == "LED ON") {
      digitalWrite(LED_BUILTIN, HIGH);
      Serial.println("LED is ON");
    }
    else if (command == "LED OFF") {
      digitalWrite(LED_BUILTIN, LOW);
      Serial.println("LED is OFF");
    }
    else {
      Serial.print("Unknown command: ");
      Serial.println(command);
    }
  }
}
```

## Integration Guides

### MicroBlocks Integration

MicroBlocks is a block-based programming language that works well with I/O:

1. Visit [MicroBlocks](https://microblocks.fun/)
2. Create a project for your device
3. Use the "Serial" block to send data
4. I/O will display all serial output

**Resources:**

- [MicroBlocks Get Started](https://microblocks.fun/get-started)
- [MicroBlocks Documentation](https://wiki.microblocks.fun/)

### Adafruit IO Integration

Connect to Adafruit IO for cloud data logging:

1. Set up an Adafruit IO account at [io.adafruit.com](https://io.adafruit.com)
2. Create feeds for your sensor data
3. Configure your device to send data in Adafruit format
4. Use I/O to monitor the communication

**Resources:**

- [Adafruit IO HTTP API](https://io.adafruit.com/api/docs/#adafruit-io-http-api)
- [Adafruit IO Documentation](https://learn.adafruit.com/adafruit-io)

## API Reference

### Web Serial API

I/O uses the Web Serial API standard:

```javascript
// Request a port from the user
const port = await navigator.serial.requestPort();

// Open the port with baud rate
await port.open({ baudRate: 9600 });

// Write data
const writer = port.writable.getWriter();
await writer.write(encoder.encode("data\n"));
writer.releaseLock();

// Read data
const reader = port.readable.getReader();
const { value, done } = await reader.read();

// Close the port
await port.close();
```

**Resources:**

- [Web Serial API MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [webserial.io - Web Serial Playground](https://webserial.io/)

## Features

- **Real-time Communication** - Send and receive data instantly
- **Multiple Devices** - Connect different devices by switching ports
- **Console Output** - Colored, organized serial communication log
- **Command History** - Press up/down arrows to recall previous commands (future enhancement)
- **Baud Rate Support** - Configurable connection speeds
- **Device Detection** - Automatic device info display

## Troubleshooting

### "Web Serial API not supported"

Your browser doesn't support Web Serial API. Use Chrome, Edge, or another Chromium-based browser version 89+.

### Device not appearing in port selection

- Ensure the device is plugged in via USB
- Check if your computer recognizes the device in Device Manager (Windows) or System Report (Mac)
- Install any required USB drivers for your device
- Try a different USB port or cable

### Can't connect after selecting port

- Make sure no other application has the port open (Arduino IDE, PuTTY, etc.)
- Check that you selected the correct baud rate (usually 9600)
- Restart the device by unplugging and reconnecting

### Data not sending

- Verify the device is responding (check LED indicators)
- Confirm your command format matches what the device expects
- Check that you have the correct baud rate configured

## Advanced Usage

### Custom Baud Rates

Currently I/O uses 9600 baud by default. To support other baud rates:

1. Update the `baudRate` variable in the script
2. Reconnect to the port with the new rate

### Firmware Development

Use I/O with your development workflow:

1. Flash your microcontroller with your code
2. Connect via I/O to test functionality
3. Monitor debug output in the console
4. Iterate and improve

## Resources

### Documentation

- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Adafruit IO HTTP API](https://io.adafruit.com/api/docs/)
- [MicroBlocks Documentation](https://wiki.microblocks.fun/)

### Learning

- [Arduino Getting Started](https://www.arduino.cc/en/Guide)
- [Adafruit Learning System](https://learn.adafruit.com/)
- [MicroBlocks Tutorials](https://microblocks.fun/tutorials)

### Tools

- [Arduino IDE](https://www.arduino.cc/en/software)
- [Arduino Web Editor](https://create.arduino.cc/editor)
- [PlatformIO](https://platformio.org/)

## Architecture

### I/O Flow

1. **User connects device** via USB
2. **Browser requests port** from Web Serial API
3. **I/O opens connection** with specified baud rate
4. **Read loop starts** listening for incoming data
5. **User sends commands** through input field
6. **Device receives and processes** commands
7. **Output displays** in color-coded console

### Key Components

- **port** - Serial port connection handle
- **reader** - Stream reader for incoming data
- **writer** - Stream writer for outgoing data
- **console** - Visual display of communication
- **status** - Connection information display

## Future Enhancements

- [ ] Configurable baud rates UI
- [ ] Command history (up/down arrows)
- [ ] Data visualization and graphing
- [ ] Log file export (CSV, JSON)
- [ ] Multiple simultaneous device connections
- [ ] Custom data formatting/parsing
- [ ] Integration with Adafruit IO feeds
- [ ] MicroBlocks live connection
- [ ] Bluetooth Serial support (Web Bluetooth API)

## License

I/O is part of the Croquet Greenlight platform.

## Support

For issues, questions, or feature requests, refer to the Greenlight documentation or project repository.
