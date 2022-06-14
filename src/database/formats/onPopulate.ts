import { SimpleEventDispatcher } from 'strongly-typed-events';
import { FormatsModel } from '.';

const onPopulate = new SimpleEventDispatcher<(FormatsModel[] | string | null)[]>();

export default onPopulate;
