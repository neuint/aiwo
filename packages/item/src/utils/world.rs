use super::log;

const MOVE_ACTION_INFO_LENGTH: usize = 1;
const MESSAGE_MAX_LENGTH: usize = 122;
const COLLISION_INFO_LENGTH: usize = 3;
const COLLISION_POINTS_COUNT: usize = 100;
const POWER_INFO_LENGTH: usize = 1;
const MESSAGE_INFO_LENGTH: usize = MESSAGE_MAX_LENGTH + 3;

const VIEW_ZONE_POINTS_COUNT: usize = 720;
const MESSAGES_COUNT: usize = 100;

const VIEW_ZONE_POINT_INFO_LENGTH: usize = 5;

pub fn set_forward(action: &mut [i32], value: i32) {
  action[MOVE_ACTION_INFO_LENGTH * 0_usize] = value;
}

pub fn get_forward(action: &mut [i32]) -> i32 {
  action[MOVE_ACTION_INFO_LENGTH * 0_usize]
}

pub fn set_back(action: &mut [i32], value: i32) {
  action[MOVE_ACTION_INFO_LENGTH * 1_usize] = value;
}

pub fn get_back(action: &mut [i32]) -> i32 {
  action[MOVE_ACTION_INFO_LENGTH * 1_usize]
}

pub fn set_rotate_left(action: &mut [i32], value: i32) {
  action[MOVE_ACTION_INFO_LENGTH * 2_usize] = value;
}

pub fn set_rotate_right(action: &mut [i32], value: i32) {
  action[MOVE_ACTION_INFO_LENGTH * 3_usize] = value;
}

pub fn set_left(action: &mut [i32], value: i32) {
  action[MOVE_ACTION_INFO_LENGTH * 4_usize] = value;
}

pub fn set_right(action: &mut [i32], value: i32) {
  action[MOVE_ACTION_INFO_LENGTH * 5_usize] = value;
}

pub fn get_collisions(world_state: &mut [i32]) -> [i32; 300] {
  const start_index: usize = POWER_INFO_LENGTH
    + VIEW_ZONE_POINTS_COUNT * VIEW_ZONE_POINT_INFO_LENGTH
    + MESSAGES_COUNT * MESSAGE_INFO_LENGTH;
  let mut result: [i32; 300] = [0_i32; 300];
  let mut index: usize = 0;
  for i in 0..COLLISION_POINTS_COUNT {
    let item_position: usize = start_index + i * COLLISION_INFO_LENGTH;
    if world_state[item_position] == 1 {
      result[index] = item_position as i32;
      world_state[item_position] = 0;
      result[index + 1] = world_state[item_position + 1];
      world_state[item_position + 1] = 0;
      result[index + 2] = world_state[item_position + 2];
      world_state[item_position + 2] = 0;
      index += 3;
    }
  }
  result
}

pub fn get_messages(world_state: &mut [i32]) -> [i32; 12500] {
  const start_index: usize = POWER_INFO_LENGTH
    + VIEW_ZONE_POINTS_COUNT * VIEW_ZONE_POINT_INFO_LENGTH;
  let mut result: [i32; 12500] = [0_i32; 12500];
  let mut index: usize = 0;
  for i in 0..MESSAGES_COUNT {
    let message_position: usize = start_index + i * MESSAGE_INFO_LENGTH;
    if world_state[message_position] == 1 {
      result[index] = message_position as i32;
      world_state[message_position] = 0;
      result[index + 1] = world_state[message_position + 1];
      world_state[message_position + 1] = 0;
      result[index + 2] = world_state[message_position + 2];
      world_state[message_position + 2] = 0;
      for j in 0..MESSAGE_MAX_LENGTH {
        result[index + 3 + j] = world_state[message_position + 3 + j];
        world_state[message_position + 3 + j] = 0;
      }
      index += MESSAGE_INFO_LENGTH;
    }
  }
  return result;
}
