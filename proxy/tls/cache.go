package tlspkg

import (
	"crypto/tls"
	"sync"
)

type CertCache struct {
	ca    *CA
	mu    sync.RWMutex
	certs map[string]*tls.Certificate
}

func NewCertCache(ca *CA) *CertCache {
	return &CertCache{
		ca:    ca,
		certs: make(map[string]*tls.Certificate),
	}
}

// ponytail: reset map on reaching 500 entries; avoid linked-list LRU overhead. Upgrade to full LRU if host diversity spikes.
func (c *CertCache) GetOrForge(host string) (*tls.Certificate, error) {
	c.mu.RLock()
	cert, ok := c.certs[host]
	c.mu.RUnlock()
	if ok {
		return cert, nil
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	if cert, ok := c.certs[host]; ok {
		return cert, nil
	}

	if len(c.certs) >= 500 {
		c.certs = make(map[string]*tls.Certificate)
	}

	forged, err := c.ca.ForgeLeaf(host)
	if err != nil {
		return nil, err
	}
	c.certs[host] = forged
	return forged, nil
}
