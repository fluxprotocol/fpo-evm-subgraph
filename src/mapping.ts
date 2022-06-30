import { FluxPriceFeed } from "../generated/FluxPriceFeed/FluxPriceFeed"
import {
  PriceFeedCreated,
  PriceFeedSignersModified
} from "../generated/FluxP2PFactory/FluxP2PFactory"
import { PriceFeed } from "../generated/schema"

export function handlePriceFeedCreated(event: PriceFeedCreated): void {
  let entity = PriceFeed.load(event.params.id)
  if (!entity) {
    entity = new PriceFeed(event.params.id)
  }

  let contract = FluxPriceFeed.bind(event.params.oracle)

  entity.address = event.params.oracle
  entity.pair = contract.description()
  entity.decimals = contract.decimals()
  entity.creator = event.transaction.from
  entity.signers = event.params.signers

  entity.save()
}

export function handlePriceFeedSignersModified(
  event: PriceFeedSignersModified
): void {
  let entity = PriceFeed.load(event.params.id)
  if (!entity) {
    return
  }

  // add or remove signer from event
}
