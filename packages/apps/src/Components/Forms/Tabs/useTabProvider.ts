import { TabContext } from "./TabContext";

import {  useContext } from 'react';

export const useTabProvider = () => useContext(TabContext);