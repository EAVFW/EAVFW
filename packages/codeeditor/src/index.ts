import { RegistereControl } from '@eavfw/apps';
import dynamic from 'next/dynamic';
RegistereControl(
  'MonacoEditorControl',
  dynamic(() => import('./MonacoEditorControl')),
);
