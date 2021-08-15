import { IResourceDictionary, IVariableDictionary } from './Content';

export interface IDeliverData {
	width: number;
	height: number;
	resources: IResourceDictionary;
	vars: IVariableDictionary;
}