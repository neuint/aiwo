mod utils;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn get_item_state_size() -> i32 {
  2000000
}

#[wasm_bindgen]
pub fn iteration(world_state: &mut [i32], item_state: &mut [f32], action: &mut [i32]) {
  let collisions = utils::world::get_collisions(world_state);
  let messages = utils::world::get_messages(world_state);
  let char_code = messages[3];
  if (char_code != 0) {
    utils::log::log(format!("char_code: {}", char_code).as_str());
  }
  if collisions[0] != 0 && utils::world::get_back(action) == 1 {
    utils::world::set_back(action, 0);
    utils::world::set_forward(action, 1);
  } else if collisions[0] != 0 && utils::world::get_forward(action) == 1 {
    utils::world::set_back(action, 1);
    utils::world::set_forward(action, 0);
  } else if utils::world::get_forward(action) == 0 && utils::world::get_back(action) == 0 {
    utils::world::set_forward(action, 1);
  }
}

#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
  utils::runtime::set_panic_hook();

  Ok(())
}