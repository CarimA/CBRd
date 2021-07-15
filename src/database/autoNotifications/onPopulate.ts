import { SimpleEventDispatcher } from 'strongly-typed-events';
import { AutoNotificationModel } from '.';

const onPopulate = new SimpleEventDispatcher<(AutoNotificationModel[] | string | null)[]>();

export default onPopulate;
