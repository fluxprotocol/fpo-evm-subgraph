import { BigInt } from '@graphprotocol/graph-ts'
import { FluxPriceFeed as PriceFeedTemplate } from "../generated/templates"
import { FluxPriceFeed as PriceFeedContract } from "../generated/templates/FluxPriceFeed/FluxPriceFeed"
import { PriceFeed as PriceFeedSchema } from "../generated/schema"
import {
  PriceFeedCreated,
  PriceFeedSignersModified
} from "../generated/FluxP2PFactory/FluxP2PFactory"

export function handlePriceFeedCreated(event: PriceFeedCreated): void {
  let entity = PriceFeedSchema.load(event.params.id)
  if (!entity) {
    entity = new PriceFeedSchema(event.params.id)
  }

  let contract = PriceFeedContract.bind(event.params.oracle)
  entity.address = event.params.oracle
  entity.pair = contract.description()
  entity.decimals = BigInt.fromI32(contract.decimals())
  entity.creator = event.transaction.from
  entity.signers = event.params.signers
  
  PriceFeedTemplate.create(event.params.oracle)

  entity.save()
}

export function handlePriceFeedSignersModified(
  event: PriceFeedSignersModified
): void {
  let entity = PriceFeedSchema.load(event.params.id)
  if (!entity) {
    return
  }

  if (event.params.isAdded == true) {
    entity.signers.push(event.params.signer)
  } else {
    entity.signers = entity.signers.filter(
      signer => signer !== event.params.signer
    )
  }

  entity.save()
}
