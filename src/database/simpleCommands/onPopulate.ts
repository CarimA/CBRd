import { SimpleEventDispatcher } from 'strongly-typed-events';
import { SimpleCommandsModel } from '.';

const onPopulate = new SimpleEventDispatcher<(SimpleCommandsModel[] | string | null)[]>();

export default onPopulate;
