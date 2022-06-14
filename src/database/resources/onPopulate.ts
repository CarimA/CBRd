import { SimpleEventDispatcher } from 'strongly-typed-events';
import { ResourcesModel } from '.';

const onPopulate = new SimpleEventDispatcher<(ResourcesModel[] | string | null)[]>();

export default onPopulate;
