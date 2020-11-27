import Button from '../../widgets/Button';
import Checkbox from '../../widgets/Checkbox';
import DisplayObject from '../../widgets/DisplayObject';
import Label from '../../widgets/Label';
import Layout from '../../widgets/Layout';
import SeriesLayout from '../../widgets/SeriesLayout';
import Text from '../../widgets/Text';

import ParamsTemplate from '../ParamsTemplate';

// WARNING: This file is auto-generated, DO NOT TOUCH!

// Generated by: /automation/WidgetsBinder.js

/** Provides app developers preloaded widget classes */
export default interface WidgetClasses {
  Button:typeof Button;
	Checkbox:typeof Checkbox;
	DisplayObject:typeof DisplayObject;
	Label:typeof Label;
	Layout:typeof Layout;
	SeriesLayout:typeof SeriesLayout;
	Text:typeof Text;
}

export const name = 'widgets';

export const bind = async (params:ParamsTemplate):Promise<WidgetClasses> => {
  return Object.freeze({
    'Button' : Button,
		'Checkbox' : Checkbox,
		'DisplayObject' : DisplayObject,
		'Label' : Label,
		'Layout' : Layout,
		'SeriesLayout' : SeriesLayout,
		'Text' : Text
  });
}

// Required for /index.m.ts
export const syncBind = (params?:ParamsTemplate):WidgetClasses => {
  return Object.freeze({
    'Button' : Button,
		'Checkbox' : Checkbox,
		'DisplayObject' : DisplayObject,
		'Label' : Label,
		'Layout' : Layout,
		'SeriesLayout' : SeriesLayout,
		'Text' : Text
  });
}