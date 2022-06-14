import { SimpleEventDispatcher } from 'strongly-typed-events';
import { SampleTeamsModel } from '.';

const onPopulate = new SimpleEventDispatcher<(SampleTeamsModel[] | string | null)[]>();

export default onPopulate;
