export function validateShippingAddress(input: {
  fulfillmentMethod: 'DELIVERY' | 'SELF_COLLECTION'
  shippingBlock?: string | null
  shippingUnitNumber?: string | null
  shippingStreet?: string | null
  shippingPostalCode?: string | null
}): string | null {
  const { fulfillmentMethod, shippingBlock, shippingUnitNumber, shippingStreet, shippingPostalCode } = input

  // Self-collection orders never need a shipping address.
  if (fulfillmentMethod === 'SELF_COLLECTION') {
    return null
  }

  if (!shippingBlock?.trim()) {
    return 'Block number is required.'
  }
  if (!/^[a-zA-Z0-9]{1,4}$/.test(shippingBlock.trim())) {
    return 'Block number must be alphanumeric, up to 4 characters (e.g. 123, 12A).'
  }

  if (!shippingStreet?.trim()) {
    return 'Street is required.'
  }

  if (!shippingPostalCode?.trim()) {
    return 'Postal code is required.'
  }
  if (!/^\d{6}$/.test(shippingPostalCode.trim())) {
    return 'Postal code must be exactly 6 digits.'
  }

  if (shippingUnitNumber && shippingUnitNumber.trim() && !shippingUnitNumber.trim().startsWith('#')) {
    return 'Unit number must start with "#" (e.g. #03-12).'
  }

  return null
}