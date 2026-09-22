export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export interface Database {
 public:{Tables:{
  profiles:{Row:{id:string;username:string|null;display_name:string|null;avatar_url:string|null;bio:string|null;created_at:string};Insert:{id:string;username?:string|null;display_name?:string|null;avatar_url?:string|null;bio?:string|null;created_at?:string};Update:Partial<profiles["Row"]>};
  places:{Row:{id:string;name:string;city:string|null;country:string|null;category:string|null;description:string|null;address:string|null;latitude:number|null;longitude:number|null;maps_url:string|null;source_url:string|null;cover_url:string|null;created_by:string|null;created_at:string};Insert:Partial<places["Row"]>&{name:string};Update:Partial<places["Row"]>};
  saved_places:{Row:{id:string;user_id:string;place_id:string;status:string;note:string|null;visit_date:string|null;rating:number|null;created_at:string};Insert:Partial<saved_places["Row"]>&{user_id:string;place_id:string};Update:Partial<saved_places["Row"]>};
  lists:{Row:{id:string;user_id:string;title:string;description:string|null;is_public:boolean;created_at:string};Insert:Partial<lists["Row"]>&{user_id:string;title:string};Update:Partial<lists["Row"]>};
  list_items:{Row:{list_id:string;place_id:string;position:number};Insert:Partial<list_items["Row"]>&{list_id:string;place_id:string};Update:Partial<list_items["Row"]>};
  friendships:{Row:{requester_id:string;addressee_id:string;status:string;created_at:string};Insert:Partial<friendships["Row"]>&{requester_id:string;addressee_id:string};Update:Partial<friendships["Row"]>};
 }}}