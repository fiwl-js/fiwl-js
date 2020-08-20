enum Prefixes {
    UP = '',
    SCREEN = 'screen-',
    MOUSE = 'mouse-',
    TOUCH = 'touch-',
    DIRECTION = 'direction',
    KEYBOARD = 'keyboard-',
    GAMEPAD = 'gamepad-',
}

export enum EventTypes {
    // Universal Pointing (UP) Event
    SELECT = Prefixes.UP + 'select',
    DOUBLE = Prefixes.UP + 'double',
    BACK = Prefixes.UP + 'back',
    OPTION = Prefixes.UP + 'option',
    SCROLL = Prefixes.UP + 'scroll',
    DRAG_START = Prefixes.UP + 'drag-start',
    DRAG_MOVE = Prefixes.UP + 'drag-move',
    DRAG_END = Prefixes.UP + 'drag-end',

    // Screen Event
    SCREEN_RESIZE = Prefixes.SCREEN + 'resize',

    // Mouse Event
    MOUSE_LEFT_PRESS = Prefixes.MOUSE + 'left-press',
    MOUSE_LEFT_DOUBLE = Prefixes.MOUSE + 'left-double',
    MOUSE_LEFT_RELEASE = Prefixes.MOUSE + 'left-release',
    MOUSE_MIDDLE_PRESS = Prefixes.MOUSE + 'middle-press',
    MOUSE_MIDDLE_DOUBLE = Prefixes.MOUSE + 'middle-double',
    MOUSE_MIDDLE_RELEASE = Prefixes.MOUSE + 'middle-release',
    MOUSE_RIGHT_PRESS = Prefixes.MOUSE + 'right-press',
    MOUSE_RIGHT_DOUBLE = Prefixes.MOUSE + 'right-double',
    MOUSE_RIGHT_RELEASE = Prefixes.MOUSE + 'right-release',
    MOUSE_HOVER_START = Prefixes.MOUSE + 'hover-start',
    MOUSE_HOVER_END = Prefixes.MOUSE + 'hover-end',
    MOUSE_MOVE = Prefixes.MOUSE + 'move',
    MOUSE_SCROLL = Prefixes.MOUSE + 'scroll',
    MOUSE_USE = Prefixes.MOUSE + 'use',
    MOUSE_UNUSE = Prefixes.MOUSE + 'unuse',

    // Touch Event
    TOUCH_START = Prefixes.TOUCH + 'start',
    TOUCH_DOUBLE = Prefixes.TOUCH + 'double',
    TOUCH_LONG = Prefixes.TOUCH + 'long',
    TOUCH_MOVE = Prefixes.TOUCH + 'move',
    TOUCH_END = Prefixes.TOUCH + 'end',
    TOUCH_ZOOM = Prefixes.TOUCH + 'zoom',
    TOUCH_ROTATE = Prefixes.TOUCH + 'rotate',

    // Direction Pad (can be keyboard or gamepad) Event
    DIRECTION_UP = Prefixes.DIRECTION + 'up',
    DIRECTION_BOTTOM = Prefixes.DIRECTION + 'bottom',
    DIRECTION_LEFT = Prefixes.DIRECTION + 'left',
    DIRECTION_RIGHT = Prefixes.DIRECTION + 'right',

    // Keyboard Event
    KEYBOARD_PRESS = Prefixes.KEYBOARD + 'press',
    KEYBOARD_DOUBLE = Prefixes.KEYBOARD + 'double',
    KEYBOARD_HOLD = Prefixes.KEYBOARD + 'hold',
    KEYBOARD_HOLD_DELAY = Prefixes.KEYBOARD + 'hold-delay',
    KEYBOARD_RELEASE = Prefixes.KEYBOARD + 'release',
    KEYBOARD_USE = Prefixes.KEYBOARD + 'use',
    KEYBOARD_UNUSE = Prefixes.KEYBOARD + 'unuse',

    // Gamepad Event
    GAMEPAD_CONNECT = Prefixes.GAMEPAD + 'connect',
    GAMEPAD_DISCONNECT = Prefixes.GAMEPAD + 'disconnect',
    GAMEPAD_PRESS = Prefixes.GAMEPAD + 'press',
    GAMEPAD_HOLD = Prefixes.GAMEPAD + 'hold',
    GAMEPAD_HOLD_DELAY = Prefixes.GAMEPAD + 'hold-delay',
    GAMEPAD_RELEASE = Prefixes.GAMEPAD + 'release',
    GAMEPAD_USE = Prefixes.GAMEPAD + 'use',
    GAMEPAD_UNUSE = Prefixes.GAMEPAD + 'unuse',
};